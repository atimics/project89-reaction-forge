import type { ReactionPreset } from '../types/reactions';

export const reactionPresets: ReactionPreset[] = [
  {
    id: 'dawn-runner',
    label: 'Dawn Runner',
    description: 'Dynamic action pose for reconnaissance briefs.',
    pose: 'dawn-runner',
    expression: 'calm',
    background: 'neural-circuit',
  },
  {
    id: 'sunset-call',
    label: 'Sunset Call',
    description: 'Confident standing pose for incoming intel.',
    pose: 'sunset-call',
    expression: 'surprise',
    background: 'protocol-gradient',
  },
  {
    id: 'cipher-whisper',
    label: 'Cipher Whisper',
    description: 'Thoughtful sitting pose for strategic planning.',
    pose: 'cipher-whisper',
    expression: 'calm',
    background: 'neural-circuit',
  },
  {
    id: 'nebula-drift',
    label: 'Nebula Drift',
    description: 'Fluid locomotion for meditative uplinks.',
    pose: 'nebula-drift',
    expression: 'joy',
    background: 'neon-waves',
  },
  {
    id: 'signal-reverie',
    label: 'Signal Reverie',
    description: 'Crouching stance with focused energy.',
    pose: 'signal-reverie',
    expression: 'surprise',
    background: 'signal-glitch',
  },
  {
    id: 'agent-taunt',
    label: 'Agent Taunt',
    description: 'Playful provocation for psychological operations.',
    pose: 'agent-taunt',
    expression: 'joy',
    background: 'quantum-particles',
  },
  {
    id: 'agent-dance',
    label: 'Agent Dance',
    description: 'Celebratory moves for mission success.',
    pose: 'agent-dance',
    expression: 'joy',
    background: 'synthwave-grid',
  },
  {
    id: 'agent-clapping',
    label: 'Agent Clapping',
    description: 'Enthusiastic applause for team victories.',
    pose: 'agent-clapping',
    expression: 'joy',
    background: 'synthwave-grid',
  },
  {
    id: 'silly-agent',
    label: 'Silly Agent',
    description: 'Playful and carefree dance moves.',
    pose: 'silly-agent',
    expression: 'joy',
    background: 'neon-waves',
  },
  {
    id: 'simple-wave',
    label: 'Wave',
    description: 'Friendly greeting gesture.',
    pose: 'simple-wave',
    expression: 'joy',
    background: 'protocol-gradient',
  },
  {
    id: 'point',
    label: 'Point',
    description: 'Directing attention forward.',
    pose: 'point',
    expression: 'calm',
    background: 'neural-circuit',
  },
  {
    id: 'defeat',
    label: 'Defeat',
    description: 'A moment of crushing setback.',
    pose: 'defeat',
    expression: 'calm',
    background: 'signal-glitch',
  },
  {
    id: 'focus',
    label: 'Focus',
    description: 'Intense concentration on the task.',
    pose: 'focus',
    expression: 'calm',
    background: 'cyber-hexagons',
  },
  {
    id: 'rope-climb',
    label: 'Rope Climb',
    description: 'Ascending vertically.',
    pose: 'rope-climb',
    expression: 'calm',
    background: 'neural-circuit',
  },
  {
    id: 'climb-top',
    label: 'Climb Top',
    description: 'Reaching the summit.',
    pose: 'climb-top',
    expression: 'joy',
    background: 'protocol-gradient',
  },
  {
    id: 'thumbs-up',
    label: 'Thumbs Up',
    description: 'Affirmative gesture.',
    pose: 'thumbs-up',
    expression: 'joy',
    background: 'synthwave-grid',
  },
  {
    id: 'offensive-idle',
    label: 'Offensive Idle',
    description: 'Ready for confrontation.',
    pose: 'offensive-idle',
    expression: 'calm',
    background: 'quantum-particles',
  },
  {
    id: 'waking',
    label: 'Waking',
    description: 'Slowly coming online.',
    pose: 'waking',
    expression: 'calm',
    background: 'void-minimal',
  },
  {
    id: 'treading-water',
    label: 'Treading Water',
    description: 'Staying afloat in the data stream.',
    pose: 'treading-water',
    expression: 'calm',
    background: 'neon-waves',
  },
  {
    id: 'cheering',
    label: 'Cheering',
    description: 'Celebrating a victory.',
    pose: 'cheering',
    expression: 'joy',
    background: 'protocol-gradient',
  },
];

const defaultPreset = reactionPresets[0];

export function pickPresetForName(name: string): ReactionPreset {
  if (!name) return defaultPreset;
  const normalized = name.trim().toLowerCase();
  const hit = reactionPresets.find((preset) => normalized.includes(preset.id.replace('-', ' ')));
  if (hit) return hit;
  const hash = normalized
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return reactionPresets[hash % reactionPresets.length];
}

export function randomPreset(): ReactionPreset {
  const index = Math.floor(Math.random() * reactionPresets.length);
  return reactionPresets[index];
}

export function findPresetById(id: string): ReactionPreset | undefined {
  return reactionPresets.find((preset) => preset.id === id);
}

export { defaultPreset };

