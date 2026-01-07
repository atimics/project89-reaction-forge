/**
 * Multiplayer Module
 * 
 * Provides peer-to-peer co-op functionality for PoseLab.
 * Enables multiple users to share a session and see each other's avatars in real-time.
 * 
 * Features:
 * - P2P avatar sync (pose, expression, position)
 * - VRM file transfer
 * - Voice chat
 * - Social features (chat, reactions, group photos)
 */

export { peerManager } from './peerManager';
export { syncManager } from './syncManager';
export { voiceChatManager } from './voiceChatManager';
export { socialManager } from './socialManager';
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
  ReactionType,
  PresenceState,
} from '../types/multiplayer';

export { DEFAULT_MULTIPLAYER_CONFIG } from '../types/multiplayer';

