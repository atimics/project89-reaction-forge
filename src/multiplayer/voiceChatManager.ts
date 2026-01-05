import Peer from 'peerjs';
import type { MediaConnection } from 'peerjs';
import type { PeerId } from '../types/multiplayer';
import { useMultiplayerStore } from '../state/useMultiplayerStore';

/**
 * VoiceChatManager handles peer-to-peer audio communication using WebRTC.
 * Works alongside the existing data-channel-based peerManager.
 */

interface AudioPeer {
  peerId: PeerId;
  mediaConnection: MediaConnection;
  audioElement: HTMLAudioElement;
  isMuted: boolean;
  volume: number;
}

type VoiceChatStateListener = (state: VoiceChatState) => void;

export interface VoiceChatState {
  isEnabled: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  volume: number;
  activePeers: Map<PeerId, { isSpeaking: boolean; volume: number }>;
}

class VoiceChatManager {
  private peer: Peer | null = null;
  private localStream: MediaStream | null = null;
  private audioPeers = new Map<PeerId, AudioPeer>();
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  
  // State
  private isEnabled = false;
  private isMuted = false;
  private volume = 1.0;
  private isSpeaking = false;
  
  // Listeners
  private stateListeners = new Set<VoiceChatStateListener>();
  private speakingCheckInterval: number | null = null;
  
  // Audio container for remote audio elements
  private audioContainer: HTMLDivElement | null = null;

  constructor() {
    // Create hidden container for audio elements
    if (typeof document !== 'undefined') {
      this.audioContainer = document.createElement('div');
      this.audioContainer.id = 'voice-chat-audio-container';
      this.audioContainer.style.display = 'none';
      document.body.appendChild(this.audioContainer);
    }
  }

  // ==================
  // Public API
  // ==================

  /**
   * Initialize voice chat with an existing Peer instance
   */
  setPeer(peer: Peer | null) {
    this.peer = peer;
    
    if (peer) {
      // Listen for incoming calls
      peer.on('call', (call) => {
        this.handleIncomingCall(call);
      });
    }
  }

  /**
   * Enable voice chat (request microphone access and start broadcasting)
   */
  async enable(): Promise<void> {
    if (this.isEnabled) return;

    try {
      // Request microphone access
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      // Setup audio analysis for speaking detection
      this.setupAudioAnalysis();

      this.isEnabled = true;
      this.notifyStateChange();

      // Call all existing peers
      const store = useMultiplayerStore.getState();
      store.peers.forEach((peerInfo, peerId) => {
        if (!peerInfo.isLocal && this.peer) {
          this.callPeer(peerId);
        }
      });

      console.log('[VoiceChatManager] Voice chat enabled');
    } catch (error) {
      console.error('[VoiceChatManager] Failed to enable voice chat:', error);
      throw error;
    }
  }

  /**
   * Disable voice chat
   */
  disable() {
    if (!this.isEnabled) return;

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close all media connections
    this.audioPeers.forEach((audioPeer) => {
      audioPeer.mediaConnection.close();
      audioPeer.audioElement.remove();
    });
    this.audioPeers.clear();

    // Cleanup audio analysis
    if (this.speakingCheckInterval) {
      clearInterval(this.speakingCheckInterval);
      this.speakingCheckInterval = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.analyser = null;
      this.gainNode = null;
    }

    this.isEnabled = false;
    this.isSpeaking = false;
    this.notifyStateChange();

    console.log('[VoiceChatManager] Voice chat disabled');
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;

    // Mute/unmute local stream tracks
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });
    }

    this.notifyStateChange();
    return this.isMuted;
  }

  /**
   * Set mute state
   */
  setMuted(muted: boolean) {
    if (this.isMuted === muted) return;
    
    this.isMuted = muted;
    
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });
    }

    this.notifyStateChange();
  }

  /**
   * Set output volume (0-1)
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Update all audio elements
    this.audioPeers.forEach((audioPeer) => {
      audioPeer.audioElement.volume = this.volume * audioPeer.volume;
    });

    this.notifyStateChange();
  }

  /**
   * Set volume for a specific peer (0-1)
   */
  setPeerVolume(peerId: PeerId, volume: number) {
    const audioPeer = this.audioPeers.get(peerId);
    if (audioPeer) {
      audioPeer.volume = Math.max(0, Math.min(1, volume));
      audioPeer.audioElement.volume = this.volume * audioPeer.volume;
      this.notifyStateChange();
    }
  }

  /**
   * Mute/unmute a specific peer
   */
  togglePeerMute(peerId: PeerId): boolean {
    const audioPeer = this.audioPeers.get(peerId);
    if (audioPeer) {
      audioPeer.isMuted = !audioPeer.isMuted;
      audioPeer.audioElement.muted = audioPeer.isMuted;
      this.notifyStateChange();
      return audioPeer.isMuted;
    }
    return false;
  }

  /**
   * Call a specific peer
   */
  callPeer(peerId: PeerId) {
    if (!this.peer || !this.localStream || this.audioPeers.has(peerId)) return;

    console.log('[VoiceChatManager] Calling peer:', peerId);
    
    const call = this.peer.call(peerId, this.localStream);
    this.setupMediaConnection(call, peerId);
  }

  /**
   * Handle peer leaving
   */
  handlePeerLeave(peerId: PeerId) {
    const audioPeer = this.audioPeers.get(peerId);
    if (audioPeer) {
      audioPeer.mediaConnection.close();
      audioPeer.audioElement.remove();
      this.audioPeers.delete(peerId);
      this.notifyStateChange();
    }
  }

  /**
   * Get current state
   */
  getState(): VoiceChatState {
    const activePeers = new Map<PeerId, { isSpeaking: boolean; volume: number }>();
    
    this.audioPeers.forEach((audioPeer, peerId) => {
      activePeers.set(peerId, {
        isSpeaking: false, // We could add speaking detection for remote peers too
        volume: audioPeer.volume,
      });
    });

    return {
      isEnabled: this.isEnabled,
      isMuted: this.isMuted,
      isSpeaking: this.isSpeaking,
      volume: this.volume,
      activePeers,
    };
  }

  /**
   * Register state change listener
   */
  onStateChange(listener: VoiceChatStateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  /**
   * Check if voice chat is available
   */
  isAvailable(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // ==================
  // Internal Methods
  // ==================

  private handleIncomingCall(call: MediaConnection) {
    const peerId = call.peer;
    console.log('[VoiceChatManager] Incoming call from:', peerId);

    // If we have a local stream, answer with it
    if (this.localStream) {
      call.answer(this.localStream);
    } else {
      // Answer without sending audio (receive only)
      call.answer();
    }

    this.setupMediaConnection(call, peerId);
  }

  private setupMediaConnection(call: MediaConnection, peerId: PeerId) {
    call.on('stream', (remoteStream) => {
      console.log('[VoiceChatManager] Received stream from:', peerId);
      
      // Create audio element for playback
      const audioElement = document.createElement('audio');
      audioElement.srcObject = remoteStream;
      audioElement.volume = this.volume;
      audioElement.autoplay = true;
      audioElement.setAttribute('playsinline', ''); // Helps on mobile
      
      // Add to container
      if (this.audioContainer) {
        this.audioContainer.appendChild(audioElement);
      }

      // iOS Safari requires explicit play() after user gesture
      // The enable() method is called from a button click, so this should work
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn('[VoiceChatManager] Audio autoplay blocked, will retry on user interaction:', error);
          // Store for retry - user's next interaction will trigger play
          const retryPlay = () => {
            audioElement.play().catch(() => {});
            document.removeEventListener('touchstart', retryPlay);
            document.removeEventListener('click', retryPlay);
          };
          document.addEventListener('touchstart', retryPlay, { once: true });
          document.addEventListener('click', retryPlay, { once: true });
        });
      }

      // Store the audio peer
      this.audioPeers.set(peerId, {
        peerId,
        mediaConnection: call,
        audioElement,
        isMuted: false,
        volume: 1.0,
      });

      this.notifyStateChange();
    });

    call.on('close', () => {
      console.log('[VoiceChatManager] Call closed with:', peerId);
      this.handlePeerLeave(peerId);
    });

    call.on('error', (err) => {
      console.error('[VoiceChatManager] Call error with', peerId, ':', err);
      this.handlePeerLeave(peerId);
    });
  }

  private setupAudioAnalysis() {
    if (!this.localStream) return;

    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    this.gainNode = this.audioContext.createGain();

    const source = this.audioContext.createMediaStreamSource(this.localStream);
    source.connect(this.analyser);
    source.connect(this.gainNode);
    // Don't connect to destination - we don't want to hear ourselves

    // Start speaking detection
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    this.speakingCheckInterval = window.setInterval(() => {
      if (!this.analyser) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      
      // Threshold for speaking detection
      const wasSpeaking = this.isSpeaking;
      this.isSpeaking = average > 20 && !this.isMuted;
      
      if (wasSpeaking !== this.isSpeaking) {
        this.notifyStateChange();
      }
    }, 100);
  }

  private notifyStateChange() {
    const state = this.getState();
    this.stateListeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('[VoiceChatManager] State listener error:', error);
      }
    });
  }

  /**
   * Cleanup everything
   */
  destroy() {
    this.disable();
    
    if (this.audioContainer) {
      this.audioContainer.remove();
      this.audioContainer = null;
    }

    this.stateListeners.clear();
    this.peer = null;
  }
}

// Singleton instance
export const voiceChatManager = new VoiceChatManager();

