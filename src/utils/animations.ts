/**
 * Animation Utilities for PoseLab
 * ═══════════════════════════════════════════════════════════════════════════
 * Ported from poselab-demo Remotion project
 * Provides spring presets, easing functions, and animation helpers
 */

// ═══════════════════════════════════════════════════════════════════════════
// SPRING PRESETS
// ═══════════════════════════════════════════════════════════════════════════

export interface SpringConfig {
  damping: number;
  mass: number;
  stiffness: number;
}

/**
 * Pre-tuned spring configurations for consistent animation feel
 */
export const springs = {
  /** Quick, responsive - good for UI feedback */
  snappy: {
    damping: 20,
    mass: 0.5,
    stiffness: 200,
  } satisfies SpringConfig,

  /** Default smooth motion - good for most transitions */
  smooth: {
    damping: 30,
    mass: 1,
    stiffness: 100,
  } satisfies SpringConfig,

  /** Playful overshoot - good for emphasis */
  bouncy: {
    damping: 12,
    mass: 0.8,
    stiffness: 180,
  } satisfies SpringConfig,

  /** Slow, elegant - good for large movements */
  gentle: {
    damping: 40,
    mass: 1.2,
    stiffness: 80,
  } satisfies SpringConfig,

  /** Very quick - good for micro-interactions */
  instant: {
    damping: 25,
    mass: 0.3,
    stiffness: 300,
  } satisfies SpringConfig,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// EASING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Common easing functions for CSS/JS animations
 */
export const easings = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Simple spring physics simulation
 * @param progress - 0 to 1 progress value
 * @param config - Spring configuration
 * @returns Animated value with spring physics applied
 */
export function springValue(
  progress: number,
  config: SpringConfig = springs.smooth
): number {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;

  const { damping, mass, stiffness } = config;
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  if (zeta < 1) {
    // Underdamped (oscillating)
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    return (
      1 -
      Math.exp(-zeta * omega * progress) *
        (Math.cos(omegaD * progress) +
          (zeta * omega / omegaD) * Math.sin(omegaD * progress))
    );
  } else {
    // Critically damped or overdamped
    return 1 - Math.exp(-omega * progress) * (1 + omega * progress);
  }
}

/**
 * Interpolate between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * Math.max(0, Math.min(1, t));
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// ═══════════════════════════════════════════════════════════════════════════
// BEAT SYNC UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get frames per beat at a given BPM and FPS
 */
export function framesPerBeat(bpm: number, fps: number): number {
  return (60 / bpm) * fps;
}

/**
 * Get the current beat number
 */
export function getCurrentBeat(frame: number, bpm: number, fps: number): number {
  return frame / framesPerBeat(bpm, fps);
}

/**
 * Get progress within the current beat (0-1)
 */
export function getBeatProgress(frame: number, bpm: number, fps: number): number {
  const beat = getCurrentBeat(frame, bpm, fps);
  return beat - Math.floor(beat);
}

/**
 * Create a pulse effect that peaks at each beat
 * @param frame - Current frame
 * @param bpm - Beats per minute
 * @param fps - Frames per second
 * @param intensity - Peak intensity (default 1)
 * @param decay - How fast the pulse fades (default 4)
 */
export function beatPulse(
  frame: number,
  bpm: number,
  fps: number,
  intensity: number = 1,
  decay: number = 4
): number {
  const progress = getBeatProgress(frame, bpm, fps);
  return Math.exp(-progress * decay) * intensity;
}

/**
 * Multi-frequency waveform for organic motion
 */
export function complexWave(frame: number, baseFreq: number = 0.1): number {
  return (
    Math.sin(frame * baseFreq) * 0.5 +
    Math.sin(frame * baseFreq * 2.1) * 0.3 +
    Math.sin(frame * baseFreq * 3.7) * 0.2
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAGGER UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate stagger delay for an item in a list
 * @param index - Item index
 * @param staggerMs - Delay between each item in ms
 * @param maxDelayMs - Maximum total delay
 */
export function staggerDelay(
  index: number,
  staggerMs: number = 50,
  maxDelayMs: number = 500
): number {
  return Math.min(index * staggerMs, maxDelayMs);
}

/**
 * Generate CSS animation delay string
 */
export function staggerDelayCSS(index: number, staggerMs: number = 50): string {
  return `${staggerDelay(index, staggerMs)}ms`;
}
