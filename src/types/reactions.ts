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
  | 'cheering';

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

