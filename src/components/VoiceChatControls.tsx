import { useState, useEffect, useCallback } from 'react';
import { useMultiplayerStore, useIsInSession } from '../state/useMultiplayerStore';
import { voiceChatManager } from '../multiplayer/voiceChatManager';
import type { VoiceChatState } from '../multiplayer/voiceChatManager';
import { useToastStore } from '../state/useToastStore';
import './VoiceChatControls.css';

interface VoiceChatControlsProps {
  /** Compact mode for minimal UI */
  compact?: boolean;
}

export function VoiceChatControls({ compact = false }: VoiceChatControlsProps) {
  const isInSession = useIsInSession();
  const { addToast } = useToastStore();
  const {
    voiceChatEnabled,
    voiceChatMuted,
    voiceChatVolume,
    localIsSpeaking,
    peers,
    setVoiceChatEnabled,
    setVoiceChatMuted,
    setVoiceChatVolume,
    setLocalIsSpeaking,
  } = useMultiplayerStore();

  const [isConnecting, setIsConnecting] = useState(false);
  const [activePeerCount, setActivePeerCount] = useState(0);

  // Subscribe to voice chat state changes
  useEffect(() => {
    const unsubscribe = voiceChatManager.onStateChange((state: VoiceChatState) => {
      setVoiceChatEnabled(state.isEnabled);
      setVoiceChatMuted(state.isMuted);
      setVoiceChatVolume(state.volume);
      setLocalIsSpeaking(state.isSpeaking);
      setActivePeerCount(state.activePeers.size);
    });

    return unsubscribe;
  }, [setVoiceChatEnabled, setVoiceChatMuted, setVoiceChatVolume, setLocalIsSpeaking]);

  // Call new peers when they join (if voice chat is enabled)
  useEffect(() => {
    if (!voiceChatEnabled) return;

    peers.forEach((peerInfo, peerId) => {
      if (!peerInfo.isLocal) {
        voiceChatManager.callPeer(peerId);
      }
    });
  }, [peers, voiceChatEnabled]);

  const handleToggleVoiceChat = useCallback(async () => {
    if (voiceChatEnabled) {
      voiceChatManager.disable();
      addToast('Voice chat disabled', 'info');
    } else {
      if (!voiceChatManager.isAvailable()) {
        addToast('Voice chat not available in this browser', 'error');
        return;
      }

      setIsConnecting(true);
      try {
        await voiceChatManager.enable();
        addToast('Voice chat enabled', 'success');
      } catch (error: any) {
        console.error('[VoiceChatControls] Failed to enable voice chat:', error);
        let message = 'Failed to enable voice chat';
        if (error.name === 'NotAllowedError') {
          message = 'Microphone permission denied';
        } else if (error.name === 'NotFoundError') {
          message = 'No microphone found';
        }
        addToast(message, 'error');
      } finally {
        setIsConnecting(false);
      }
    }
  }, [voiceChatEnabled, addToast]);

  const handleToggleMute = useCallback(() => {
    const newMuted = voiceChatManager.toggleMute();
    addToast(newMuted ? 'Microphone muted' : 'Microphone unmuted', 'info');
  }, [addToast]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    voiceChatManager.setVolume(volume);
  }, []);

  // Don't render if not in a session
  if (!isInSession) {
    return null;
  }

  // Compact mode - just a mic button
  if (compact) {
    return (
      <div className="voice-chat-compact">
        <button
          className={`voice-btn ${voiceChatEnabled ? (voiceChatMuted ? 'muted' : 'active') : ''} ${localIsSpeaking ? 'speaking' : ''}`}
          onClick={voiceChatEnabled ? handleToggleMute : handleToggleVoiceChat}
          disabled={isConnecting}
          title={
            isConnecting
              ? 'Connecting...'
              : voiceChatEnabled
              ? voiceChatMuted
                ? 'Unmute microphone'
                : 'Mute microphone'
              : 'Enable voice chat'
          }
        >
          {isConnecting ? (
            <span className="voice-spinner">⏳</span>
          ) : voiceChatEnabled ? (
            voiceChatMuted ? '🔇' : localIsSpeaking ? '🗣️' : '🎙️'
          ) : (
            '🎤'
          )}
        </button>
        {voiceChatEnabled && activePeerCount > 0 && (
          <span className="voice-peer-count">{activePeerCount}</span>
        )}
      </div>
    );
  }

  // Full controls
  return (
    <div className="voice-chat-controls">
      <div className="voice-header">
        <span className="voice-title">🎤 Voice Chat</span>
        {voiceChatEnabled && (
          <span className={`voice-status ${localIsSpeaking ? 'speaking' : ''}`}>
            {localIsSpeaking ? '🗣️ Speaking' : voiceChatMuted ? '🔇 Muted' : '● Active'}
          </span>
        )}
      </div>

      <div className="voice-main-controls">
        <button
          className={`voice-toggle-btn ${voiceChatEnabled ? 'enabled' : ''}`}
          onClick={handleToggleVoiceChat}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>⏳ Connecting...</>
          ) : voiceChatEnabled ? (
            <>🛑 Disable Voice</>
          ) : (
            <>🎤 Enable Voice</>
          )}
        </button>

        {voiceChatEnabled && (
          <button
            className={`voice-mute-btn ${voiceChatMuted ? 'muted' : ''}`}
            onClick={handleToggleMute}
            title={voiceChatMuted ? 'Unmute' : 'Mute'}
          >
            {voiceChatMuted ? '🔇' : '🔊'}
          </button>
        )}
      </div>

      {voiceChatEnabled && (
        <>
          <div className="voice-volume-control">
            <label>
              <span>Volume</span>
              <span className="voice-volume-value">{Math.round(voiceChatVolume * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={voiceChatVolume}
              onChange={handleVolumeChange}
            />
          </div>

          {activePeerCount > 0 && (
            <div className="voice-peers-info">
              <span className="voice-peers-label">
                🔊 {activePeerCount} peer{activePeerCount !== 1 ? 's' : ''} connected
              </span>
            </div>
          )}

          {/* Speaking indicator */}
          <div className={`voice-speaking-indicator ${localIsSpeaking ? 'active' : ''}`}>
            <div className="voice-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

