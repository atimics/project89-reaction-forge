/**
 * Multiplayer Module
 * 
 * Provides peer-to-peer co-op functionality for PoseLab.
 * Enables multiple users to share a session and see each other's avatars in real-time.
 */

export { peerManager } from './peerManager';
export { syncManager } from './syncManager';
export { voiceChatManager } from './voiceChatManager';
export { 
  initAvatarBridge, 
  loadAvatar, 
  notifyPoseChange, 
  notifyExpressionChange,
  notifySceneChange,
  getAllAvatarPeerIds,
  getAvatarCount,
} from './avatarBridge';

// Re-export types
export type {
  PeerId,
  RoomId,
  ConnectionState,
  SessionRole,
  AvatarState,
  PeerInfo,
  SessionState,
  PeerMessage,
  MultiplayerConfig,
} from '../types/multiplayer';

export { DEFAULT_MULTIPLAYER_CONFIG } from '../types/multiplayer';

