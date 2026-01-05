import { create } from 'zustand';
import type { 
  PeerId, 
  RoomId, 
  SessionRole, 
  PeerInfo, 
  AvatarState 
} from '../types/multiplayer';

// Voice chat state for a peer
export interface PeerVoiceState {
  isEnabled: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  volume: number;
}

interface MultiplayerState {
  // Session state
  roomId: RoomId | null;
  role: SessionRole | null;
  isConnected: boolean;
  isConnecting: boolean;
  localPeerId: PeerId | null;
  localDisplayName: string;
  
  // Peers
  peers: Map<PeerId, PeerInfo>;
  
  // Remote avatar states (for rendering)
  remoteAvatarStates: Map<PeerId, AvatarState>;
  
  // Error state
  error: string | null;
  
  // Latency tracking
  peerLatencies: Map<PeerId, number>;
  
  // Voice chat state
  voiceChatEnabled: boolean;
  voiceChatMuted: boolean;
  voiceChatVolume: number;
  localIsSpeaking: boolean;
  peerVoiceStates: Map<PeerId, PeerVoiceState>;
  
  // Actions
  setRoomId: (roomId: RoomId | null) => void;
  setRole: (role: SessionRole | null) => void;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setLocalPeerId: (peerId: PeerId | null) => void;
  setLocalDisplayName: (name: string) => void;
  setError: (error: string | null) => void;
  
  // Peer management
  addPeer: (peerId: PeerId, info: Omit<PeerInfo, 'peerId'>) => void;
  updatePeer: (peerId: PeerId, updates: Partial<PeerInfo>) => void;
  removePeer: (peerId: PeerId) => void;
  clearPeers: () => void;
  
  // Avatar state management
  updateRemoteAvatarState: (peerId: PeerId, state: AvatarState) => void;
  removeRemoteAvatarState: (peerId: PeerId) => void;
  clearRemoteAvatarStates: () => void;
  
  // Latency
  updatePeerLatency: (peerId: PeerId, latency: number) => void;
  
  // Voice chat actions
  setVoiceChatEnabled: (enabled: boolean) => void;
  setVoiceChatMuted: (muted: boolean) => void;
  setVoiceChatVolume: (volume: number) => void;
  setLocalIsSpeaking: (speaking: boolean) => void;
  updatePeerVoiceState: (peerId: PeerId, state: Partial<PeerVoiceState>) => void;
  
  // Session lifecycle
  resetSession: () => void;
}

// Generate a random display name
function generateDisplayName(): string {
  const adjectives = ['Swift', 'Cosmic', 'Neon', 'Digital', 'Quantum', 'Cyber', 'Neural', 'Void'];
  const nouns = ['Runner', 'Ghost', 'Phantom', 'Weaver', 'Drifter', 'Seeker', 'Walker', 'Agent'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
}

export const useMultiplayerStore = create<MultiplayerState>((set) => ({
  // Initial state
  roomId: null,
  role: null,
  isConnected: false,
  isConnecting: false,
  localPeerId: null,
  localDisplayName: generateDisplayName(),
  peers: new Map(),
  remoteAvatarStates: new Map(),
  error: null,
  peerLatencies: new Map(),
  
  // Voice chat initial state
  voiceChatEnabled: false,
  voiceChatMuted: false,
  voiceChatVolume: 1.0,
  localIsSpeaking: false,
  peerVoiceStates: new Map(),
  
  // Setters
  setRoomId: (roomId) => set({ roomId }),
  setRole: (role) => set({ role }),
  setConnected: (isConnected) => set({ isConnected, isConnecting: false }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  setLocalPeerId: (localPeerId) => set({ localPeerId }),
  setLocalDisplayName: (localDisplayName) => set({ localDisplayName }),
  setError: (error) => set({ error, isConnecting: false }),
  
  // Peer management
  addPeer: (peerId, info) => {
    set((state) => {
      const newPeers = new Map(state.peers);
      newPeers.set(peerId, { peerId, ...info });
      return { peers: newPeers };
    });
  },
  
  updatePeer: (peerId, updates) => {
    set((state) => {
      const newPeers = new Map(state.peers);
      const existing = newPeers.get(peerId);
      if (existing) {
        newPeers.set(peerId, { ...existing, ...updates });
      }
      return { peers: newPeers };
    });
  },
  
  removePeer: (peerId) => {
    set((state) => {
      const newPeers = new Map(state.peers);
      newPeers.delete(peerId);
      
      const newRemoteStates = new Map(state.remoteAvatarStates);
      newRemoteStates.delete(peerId);
      
      const newLatencies = new Map(state.peerLatencies);
      newLatencies.delete(peerId);
      
      return { 
        peers: newPeers, 
        remoteAvatarStates: newRemoteStates,
        peerLatencies: newLatencies 
      };
    });
  },
  
  clearPeers: () => {
    set({ peers: new Map() });
  },
  
  // Avatar state management
  updateRemoteAvatarState: (peerId, state) => {
    set((s) => {
      const newStates = new Map(s.remoteAvatarStates);
      newStates.set(peerId, state);
      return { remoteAvatarStates: newStates };
    });
  },
  
  removeRemoteAvatarState: (peerId) => {
    set((s) => {
      const newStates = new Map(s.remoteAvatarStates);
      newStates.delete(peerId);
      return { remoteAvatarStates: newStates };
    });
  },
  
  clearRemoteAvatarStates: () => {
    set({ remoteAvatarStates: new Map() });
  },
  
  // Latency
  updatePeerLatency: (peerId, latency) => {
    set((state) => {
      const newLatencies = new Map(state.peerLatencies);
      newLatencies.set(peerId, latency);
      return { peerLatencies: newLatencies };
    });
  },
  
  // Voice chat actions
  setVoiceChatEnabled: (enabled) => set({ voiceChatEnabled: enabled }),
  setVoiceChatMuted: (muted) => set({ voiceChatMuted: muted }),
  setVoiceChatVolume: (volume) => set({ voiceChatVolume: volume }),
  setLocalIsSpeaking: (speaking) => set({ localIsSpeaking: speaking }),
  
  updatePeerVoiceState: (peerId, state) => {
    set((s) => {
      const newStates = new Map(s.peerVoiceStates);
      const existing = newStates.get(peerId) || {
        isEnabled: false,
        isMuted: false,
        isSpeaking: false,
        volume: 1.0,
      };
      newStates.set(peerId, { ...existing, ...state });
      return { peerVoiceStates: newStates };
    });
  },
  
  // Session lifecycle
  resetSession: () => {
    set({
      roomId: null,
      role: null,
      isConnected: false,
      isConnecting: false,
      localPeerId: null,
      peers: new Map(),
      remoteAvatarStates: new Map(),
      error: null,
      peerLatencies: new Map(),
      voiceChatEnabled: false,
      voiceChatMuted: false,
      voiceChatVolume: 1.0,
      localIsSpeaking: false,
      peerVoiceStates: new Map(),
    });
  },
}));

// Selector hooks for common patterns
export const useIsInSession = () => useMultiplayerStore((s) => s.isConnected && s.roomId !== null);
export const usePeerCount = () => useMultiplayerStore((s) => s.peers.size);
export const useLocalPeer = () => useMultiplayerStore((s) => ({
  peerId: s.localPeerId,
  displayName: s.localDisplayName,
  isHost: s.role === 'host',
}));

