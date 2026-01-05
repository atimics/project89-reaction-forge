import type { VRMPose } from '@pixiv/three-vrm';

/** Unique identifier for a peer in the session */
export type PeerId = string;

/** Unique identifier for a multiplayer room/session */
export type RoomId = string;

/** Connection state for a peer */
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

/** Role in the session */
export type SessionRole = 'host' | 'guest';

/** Avatar state that gets synchronized across peers */
export interface AvatarState {
  peerId: PeerId;
  displayName: string;
  /** Scene rotation of the avatar root */
  sceneRotation: { x: number; y: number; z: number };
  /** Normalized bone pose */
  pose: VRMPose;
  /** Expression weights (e.g., { Joy: 0.8, Angry: 0 }) */
  expressions: Record<string, number>;
  /** Position offset in scene (for multiple avatars) */
  position: { x: number; y: number; z: number };
  /** Whether this avatar has a VRM loaded */
  hasAvatar: boolean;
  /** Timestamp for ordering/staleness */
  timestamp: number;
}

/** Peer info for UI display */
export interface PeerInfo {
  peerId: PeerId;
  displayName: string;
  connectionState: ConnectionState;
  hasAvatar: boolean;
  isLocal: boolean;
}

/** Session state */
export interface SessionState {
  roomId: RoomId | null;
  role: SessionRole | null;
  isConnected: boolean;
  peers: Map<PeerId, PeerInfo>;
  localPeerId: PeerId | null;
}

/** Message types for peer communication */
export type MessageType = 
  | 'avatar-state'      // Full avatar state update
  | 'pose-update'       // Incremental pose update (high frequency)
  | 'expression-update' // Expression change
  | 'vrm-request'       // Request VRM file from peer
  | 'vrm-chunk'         // VRM file data chunk
  | 'vrm-complete'      // VRM transfer complete
  | 'peer-join'         // Peer joined session
  | 'peer-leave'        // Peer left session
  | 'sync-request'      // Request full state sync
  | 'sync-response'     // Full state sync response
  | 'scene-sync'        // Scene settings sync (background, etc.)
  | 'ping'              // Latency check
  | 'pong';             // Latency response

/** Base message structure */
export interface BaseMessage {
  type: MessageType;
  peerId: PeerId;
  timestamp: number;
}

/** Avatar state message (full update) */
export interface AvatarStateMessage extends BaseMessage {
  type: 'avatar-state';
  state: AvatarState;
}

/** High-frequency pose update (optimized) */
export interface PoseUpdateMessage extends BaseMessage {
  type: 'pose-update';
  pose: VRMPose;
  sceneRotation?: { x: number; y: number; z: number };
  /** User-controlled position offset (X-axis translation via gizmo) */
  scenePosition?: { x: number; y: number; z: number };
}

/** Expression update */
export interface ExpressionUpdateMessage extends BaseMessage {
  type: 'expression-update';
  expressions: Record<string, number>;
}

/** VRM file transfer messages */
export interface VRMRequestMessage extends BaseMessage {
  type: 'vrm-request';
  targetPeerId: PeerId;
}

export interface VRMChunkMessage extends BaseMessage {
  type: 'vrm-chunk';
  targetPeerId: PeerId;
  chunkIndex: number;
  totalChunks: number;
  data: string; // Base64 encoded chunk (JSON serialization compatible)
}

export interface VRMCompleteMessage extends BaseMessage {
  type: 'vrm-complete';
  targetPeerId: PeerId;
  fileName: string;
  totalSize: number;
}

/** Peer events */
export interface PeerJoinMessage extends BaseMessage {
  type: 'peer-join';
  displayName: string;
}

export interface PeerLeaveMessage extends BaseMessage {
  type: 'peer-leave';
}

/** Sync messages */
export interface SyncRequestMessage extends BaseMessage {
  type: 'sync-request';
}

export interface SyncResponseMessage extends BaseMessage {
  type: 'sync-response';
  avatarStates: AvatarState[];
  sceneSettings?: {
    background?: string;
    aspectRatio?: string;
  };
}

/** Scene sync */
export interface SceneSyncMessage extends BaseMessage {
  type: 'scene-sync';
  background?: string;
  aspectRatio?: string;
  /** Base64 encoded custom background image data */
  customBackgroundData?: string;
  /** MIME type of custom background */
  customBackgroundType?: string;
}

/** Ping/Pong for latency */
export interface PingMessage extends BaseMessage {
  type: 'ping';
  sentAt: number;
}

export interface PongMessage extends BaseMessage {
  type: 'pong';
  sentAt: number;
  receivedAt: number;
}

/** Union type for all messages */
export type PeerMessage = 
  | AvatarStateMessage
  | PoseUpdateMessage
  | ExpressionUpdateMessage
  | VRMRequestMessage
  | VRMChunkMessage
  | VRMCompleteMessage
  | PeerJoinMessage
  | PeerLeaveMessage
  | SyncRequestMessage
  | SyncResponseMessage
  | SceneSyncMessage
  | PingMessage
  | PongMessage;

/** Configuration for multiplayer */
export interface MultiplayerConfig {
  /** Maximum peers in a session */
  maxPeers: number;
  /** Pose sync rate in Hz */
  poseSyncRate: number;
  /** Enable VRM file transfer between peers */
  enableVRMTransfer: boolean;
  /** VRM chunk size for transfer (bytes) */
  vrmChunkSize: number;
  /** Connection timeout in ms */
  connectionTimeout: number;
  /** Reconnection attempts */
  reconnectAttempts: number;
}

/** Default config */
export const DEFAULT_MULTIPLAYER_CONFIG: MultiplayerConfig = {
  maxPeers: 8,
  poseSyncRate: 30, // 30 FPS sync
  enableVRMTransfer: true,
  vrmChunkSize: 6 * 1024, // 6KB chunks (~8KB as base64, fits in PeerJS JSON limit)
  connectionTimeout: 10000,
  reconnectAttempts: 3,
};

