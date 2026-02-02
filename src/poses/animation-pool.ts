import type { PoseId } from '../types/reactions';

export interface AnimationPoolItem {
  id: PoseId;
  label: string;
  category: 'locomotion' | 'idle' | 'sitting' | 'social' | 'action';
  file: string; // The .json filename
}

export const ANIMATION_POOL: AnimationPoolItem[] = [
  // Locomotion
  { id: 'locomotion-walk', label: 'Walk', category: 'locomotion', file: 'locomotion-walk' },
  { id: 'locomotion-run', label: 'Run', category: 'locomotion', file: 'locomotion-run' },
  { id: 'locomotion-jog', label: 'Jog', category: 'locomotion', file: 'locomotion-jog' },
  { id: 'locomotion-crouch-walk', label: 'Crouch Walk', category: 'locomotion', file: 'locomotion-crouch-walk' },
  { id: 'locomotion-turn-left', label: 'Turn Left', category: 'locomotion', file: 'locomotion-turn-left' },
  { id: 'locomotion-turn-right', label: 'Turn Right', category: 'locomotion', file: 'locomotion-turn-right' },
  { id: 'locomotion-stop', label: 'Stop Walking', category: 'locomotion', file: 'locomotion-stop' },

  // Idles
  { id: 'idle-neutral', label: 'Neutral Idle', category: 'idle', file: 'idle-neutral' },
  { id: 'idle-happy', label: 'Happy Idle', category: 'idle', file: 'idle-happy' },
  { id: 'idle-breathing', label: 'Breathing Idle', category: 'idle', file: 'idle-breathing' },
  { id: 'idle-nervous', label: 'Nervous Look', category: 'idle', file: 'idle-nervous' },
  { id: 'idle-offensive', label: 'Offensive Idle', category: 'idle', file: 'idle-offensive' },

  // Sitting
  { id: 'sit-chair', label: 'Sit (Chair)', category: 'sitting', file: 'sit-chair' },
  { id: 'sit-floor', label: 'Sit (Floor)', category: 'sitting', file: 'sit-floor' },
  { id: 'sit-sad', label: 'Sit (Sad)', category: 'sitting', file: 'sit-sad' },
  { id: 'sit-typing', label: 'Typing', category: 'sitting', file: 'sit-typing' },
  { id: 'transition-stand-to-sit', label: 'Stand to Sit', category: 'sitting', file: 'transition-stand-to-sit' },
  { id: 'transition-sit-to-stand', label: 'Sit to Stand', category: 'sitting', file: 'transition-sit-to-stand' },
  { id: 'transition-floor-to-stand', label: 'Floor to Stand', category: 'sitting', file: 'transition-floor-to-stand' },

  // Social
  { id: 'emote-wave', label: 'Wave', category: 'social', file: 'emote-wave' },
  { id: 'emote-point', label: 'Point', category: 'social', file: 'emote-point' },
  { id: 'emote-clap', label: 'Clap', category: 'social', file: 'emote-clap' },
  { id: 'emote-cheer', label: 'Cheer', category: 'social', file: 'emote-cheer' },
  { id: 'emote-thumbsup', label: 'Thumbs Up', category: 'social', file: 'emote-thumbsup' },
  { id: 'emote-bow', label: 'Bow', category: 'social', file: 'emote-bow' },
  { id: 'emote-dance-silly', label: 'Silly Dance', category: 'social', file: 'emote-dance-silly' },
  { id: 'emote-taunt', label: 'Taunt', category: 'social', file: 'emote-taunt' },
  { id: 'emote-bored', label: 'Bored', category: 'social', file: 'emote-bored' },

  // Action
  { id: 'action-defeat', label: 'Defeat', category: 'action', file: 'action-defeat' },
  { id: 'action-focus', label: 'Focus', category: 'action', file: 'action-focus' },
  { id: 'action-rope-climb', label: 'Rope Climb', category: 'action', file: 'action-rope-climb' },
  { id: 'action-climb-top', label: 'Climb Top', category: 'action', file: 'action-climb-top' },
  { id: 'action-swim', label: 'Swimming', category: 'action', file: 'action-swim' },
  { id: 'action-waking', label: 'Waking Up', category: 'action', file: 'action-waking' },
];
