export type PoseId =
  | 'dawn-runner'
  | 'sunset-call'
  | 'cipher-whisper'
  | 'nebula-drift'
  | 'signal-reverie'
  | 'agent-taunt'
  | 'agent-dance'
  | 'agent-clapping'
  | 'silly-agent'
  | 'simple-wave'
  | 'point'
  | 'defeat'
  | 'focus'
  | 'rope-climb'
  | 'climb-top'
  | 'thumbs-up'
  | 'offensive-idle'
  | 'waking'
  | 'treading-water'
  | 'cheering'
  // New Locomotion Pool
  | 'locomotion-walk'
  | 'locomotion-run'
  | 'locomotion-jog'
  | 'locomotion-crouch-walk'
  | 'locomotion-turn-left'
  | 'locomotion-turn-right'
  | 'locomotion-stop'
  // New Idle Pool
  | 'idle-neutral'
  | 'idle-happy'
  | 'idle-breathing'
  | 'idle-nervous'
  | 'idle-offensive'
  // New Sitting Pool
  | 'sit-chair'
  | 'sit-floor'
  | 'sit-sad'
  | 'sit-typing'
  | 'transition-stand-to-sit'
  | 'transition-sit-to-stand'
  | 'transition-floor-to-stand'
  // New Social Pool
  | 'emote-wave'
  | 'emote-point'
  | 'emote-clap'
  | 'emote-cheer'
  | 'emote-thumbsup'
  | 'emote-bow'
  | 'emote-dance-silly'
  | 'emote-taunt'
  | 'emote-bored'
  // New Action Pool
  | 'action-defeat'
  | 'action-focus'
  | 'action-rope-climb'
  | 'action-climb-top'
  | 'action-swim'
  | 'action-waking';

export type ExpressionId = 'calm' | 'joy' | 'surprise';

export type BackgroundId = 
  // V2 Lightweight Vector Backgrounds
  | 'synthwave-grid'
  | 'neural-circuit'
  | 'neon-waves'
  | 'quantum-particles'
  | 'signal-glitch'
  | 'cyber-hexagons'
  | 'protocol-gradient'
  | 'void-minimal'
  // Utility
  | 'green-screen'
  | 'lush-forest'
  | 'volcano'
  | 'deep-sea'
  | 'glass-platform'
  | 'hacker-room'
  | 'industrial'
  | 'rooftop-garden'
  | 'shinto-shrine';

// Animation playback mode
export type AnimationMode = 'static' | 'loop' | 'once';

export type ReactionPreset = {
  id: string;
  label: string;
  description: string;
  pose: PoseId;
  expression: ExpressionId;
  background: BackgroundId;
  // Optional: if true, play as animation instead of static pose
  animated?: boolean;
  // Optional: animation playback mode
  animationMode?: AnimationMode;
};

