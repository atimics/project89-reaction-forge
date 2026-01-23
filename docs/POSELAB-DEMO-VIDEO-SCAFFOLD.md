# PoseLab Demo Video - Remotion Project Scaffold

## Project Overview

This document provides a complete specification for scaffolding a **Remotion-based demo video** for PoseLab, a browser-based VRM avatar animation studio by Project 89.

**Goal**: Create a polished 60-90 second product demo video showcasing PoseLab's key features for marketing, social media, and the landing page.

**Output Formats**:
- 1920x1080 (YouTube/Landing Page)
- 1080x1920 (TikTok/Reels/Shorts)
- 1080x1080 (Twitter/Instagram Square)

---

## Tech Stack

```
remotion@4.x          # Core video framework
@remotion/cli         # Rendering CLI
@remotion/player      # Preview player
react@18+             # UI framework
typescript            # Type safety
```

---

## Quick Start Commands

```bash
# 1. Create the project
npx create-video@latest poselab-demo
cd poselab-demo

# 2. Install additional deps
npm install @remotion/tailwind @remotion/transitions

# 3. Start development
npm run dev

# 4. Render final video
npx remotion render src/index.ts MainComposition out/poselab-demo.mp4
```

---

## Directory Structure

```
poselab-demo/
├── public/
│   ├── assets/
│   │   ├── recordings/         # Screen recordings from PoseLab
│   │   │   ├── hero-loop.webm
│   │   │   ├── ai-pose-gen.webm
│   │   │   ├── mocap-demo.webm
│   │   │   ├── manual-posing.webm
│   │   │   ├── export-flow.webm
│   │   │   └── multiplayer.webm
│   │   ├── screenshots/        # Static screenshots
│   │   ├── logos/
│   │   │   ├── poselab-logo.svg
│   │   │   └── project89-logo.svg
│   │   ├── avatars/            # VRM renders / PNGs of avatars
│   │   └── audio/
│   │       ├── bgm.mp3         # Background music
│   │       └── sfx/            # UI sounds, whooshes
│   └── fonts/
│       ├── Orbitron-*.woff2    # Display font
│       ├── SpaceGrotesk-*.woff2 # Body font
│       └── JetBrainsMono-*.woff2 # Mono font
├── src/
│   ├── index.ts                # Remotion entry
│   ├── Root.tsx                # Composition registration
│   ├── Video.tsx               # Main composition
│   ├── compositions/
│   │   ├── MainComposition.tsx # Full video
│   │   ├── IntroScene.tsx      # Opening logo + tagline
│   │   ├── FeatureScene.tsx    # Individual feature showcase
│   │   ├── HeroScene.tsx       # Main product shot
│   │   ├── CTAScene.tsx        # Call to action ending
│   │   └── TransitionScene.tsx # Scene transitions
│   ├── components/
│   │   ├── Logo.tsx            # Animated PoseLab logo
│   │   ├── FeatureCard.tsx     # Feature highlight card
│   │   ├── DeviceMockup.tsx    # Browser frame for recordings
│   │   ├── TextReveal.tsx      # Animated text component
│   │   ├── GlowBackground.tsx  # Aurora gradient background
│   │   ├── ParticleField.tsx   # Floating particles effect
│   │   └── ProgressBar.tsx     # Feature progress indicator
│   ├── styles/
│   │   ├── tokens.ts           # Design tokens from PoseLab
│   │   ├── fonts.css           # @font-face declarations
│   │   └── global.css          # Global styles
│   ├── utils/
│   │   ├── animations.ts       # Spring/easing presets
│   │   ├── timing.ts           # Scene timing constants
│   │   └── interpolations.ts   # Custom interpolation helpers
│   └── data/
│       └── features.ts         # Feature list data
├── package.json
├── remotion.config.ts
├── tsconfig.json
└── README.md
```

---

## Design Tokens (from PoseLab)

Create `src/styles/tokens.ts`:

```typescript
// PoseLab Design Tokens for Remotion
// Extracted from PoseLab Design System v2.0

export const colors = {
  // Background Layers
  void: '#000000',
  abyss: '#030305',
  deep: '#070910',
  surface: '#0c0f18',
  elevated: '#12161f',
  card: '#181c28',
  hover: '#1e2330',

  // Glass Surfaces
  glass: {
    bg: 'rgba(12, 15, 24, 0.72)',
    border: 'rgba(255, 255, 255, 0.06)',
    hover: 'rgba(255, 255, 255, 0.08)',
  },

  // Primary - Aurora Cyan
  accent: {
    50: '#e6fffc',
    100: '#b3fff5',
    200: '#80ffed',
    300: '#4dffe6',
    400: '#1affdf',
    DEFAULT: '#00ffd6',
    600: '#00d4b3',
    700: '#00a890',
    800: '#007d6d',
    900: '#00524a',
  },

  // Secondary - Electric Violet
  violet: {
    DEFAULT: '#7c3aed',
    400: '#9333ff',
    600: '#6d28d9',
  },

  // Tertiary - Solar Orange
  solar: {
    DEFAULT: '#f97316',
    400: '#fb923c',
    600: '#ea580c',
  },

  // Semantic
  success: '#00ff9d',
  warning: '#fbbf24',
  error: '#ff3366',
  info: '#38bdf8',

  // Text
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.72)',
    tertiary: 'rgba(255, 255, 255, 0.48)',
    muted: 'rgba(255, 255, 255, 0.32)',
    onAccent: '#030305',
  },

  // Borders
  border: {
    subtle: 'rgba(255, 255, 255, 0.04)',
    default: 'rgba(255, 255, 255, 0.08)',
    emphasis: 'rgba(255, 255, 255, 0.16)',
    accent: 'rgba(0, 255, 214, 0.32)',
  },
} as const;

export const fonts = {
  display: "'Orbitron', 'Rajdhani', system-ui, sans-serif",
  body: "'Space Grotesk', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 21,
  '2xl': 28,
  '3xl': 38,
  '4xl': 50,
  '5xl': 67,
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  '2xl': 28,
  full: 9999,
} as const;

export const shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.4)',
  md: '0 4px 12px rgba(0, 0, 0, 0.5)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.6)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.7)',
  glow: '0 0 40px rgba(0, 255, 214, 0.15)',
  glowStrong: '0 0 60px rgba(0, 255, 214, 0.25)',
} as const;

// Gradient definitions for backgrounds
export const gradients = {
  aurora: 'linear-gradient(135deg, #00ffd6 0%, #7c3aed 50%, #f97316 100%)',
  auroraSubtle: 'linear-gradient(135deg, rgba(0, 255, 214, 0.08) 0%, rgba(124, 58, 237, 0.08) 50%, rgba(249, 115, 22, 0.05) 100%)',
  mesh: `
    radial-gradient(circle at 20% 20%, rgba(0, 255, 214, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 30%, rgba(124, 58, 237, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(249, 115, 22, 0.08) 0%, transparent 50%),
    #030305
  `,
} as const;
```

---

## Timing & Composition Structure

Create `src/utils/timing.ts`:

```typescript
// Video timing configuration
// Total duration: ~75 seconds (2250 frames @ 30fps)

export const FPS = 30;

export const scenes = {
  intro: {
    start: 0,
    duration: 4 * FPS,  // 4 seconds - Logo reveal + tagline
  },
  hero: {
    start: 4 * FPS,
    duration: 8 * FPS,  // 8 seconds - Full app showcase loop
  },
  feature1_aiPose: {
    start: 12 * FPS,
    duration: 10 * FPS, // 10 seconds - AI Pose Generation
  },
  feature2_mocap: {
    start: 22 * FPS,
    duration: 10 * FPS, // 10 seconds - Webcam Mocap
  },
  feature3_manualPosing: {
    start: 32 * FPS,
    duration: 8 * FPS,  // 8 seconds - Manual Posing with Gizmos
  },
  feature4_export: {
    start: 40 * FPS,
    duration: 8 * FPS,  // 8 seconds - Export options
  },
  feature5_multiplayer: {
    start: 48 * FPS,
    duration: 8 * FPS,  // 8 seconds - Co-op sessions
  },
  feature6_environments: {
    start: 56 * FPS,
    duration: 8 * FPS,  // 8 seconds - 3D environments, HDRI, effects
  },
  cta: {
    start: 64 * FPS,
    duration: 6 * FPS,  // 6 seconds - Call to action
  },
  outro: {
    start: 70 * FPS,
    duration: 5 * FPS,  // 5 seconds - Logo + URL
  },
} as const;

export const TOTAL_DURATION = 75 * FPS; // 2250 frames
```

---

## Feature Data

Create `src/data/features.ts`:

```typescript
export interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  videoSrc: string;
  icon: string; // emoji or path to icon
  accentColor: string;
}

export const features: Feature[] = [
  {
    id: 'ai-pose',
    title: 'AI Pose Generation',
    subtitle: 'Describe it. See it.',
    description: 'Type a natural language description and watch Gemini AI generate the pose instantly.',
    videoSrc: '/assets/recordings/ai-pose-gen.webm',
    icon: '✨',
    accentColor: '#00ffd6', // cyan
  },
  {
    id: 'mocap',
    title: 'Webcam Mocap',
    subtitle: 'Your body. Their body.',
    description: 'Real-time body + face tracking with calibration and smoothing. No hardware needed.',
    videoSrc: '/assets/recordings/mocap-demo.webm',
    icon: '📷',
    accentColor: '#7c3aed', // violet
  },
  {
    id: 'manual-posing',
    title: 'Manual Posing',
    subtitle: 'Precision control.',
    description: 'Fine-tune every joint with intuitive gizmos. Rotate, translate, perfect.',
    videoSrc: '/assets/recordings/manual-posing.webm',
    icon: '🎯',
    accentColor: '#f97316', // solar
  },
  {
    id: 'export',
    title: 'Production Ready',
    subtitle: 'Export anything.',
    description: 'PNG, WebM, transparent backgrounds. Presets for YouTube, TikTok, and more.',
    videoSrc: '/assets/recordings/export-flow.webm',
    icon: '🚀',
    accentColor: '#00ff9d', // success green
  },
  {
    id: 'multiplayer',
    title: 'Multiplayer Sessions',
    subtitle: 'Create together.',
    description: 'Host or join a room. Sync scenes, avatars, and poses in real-time.',
    videoSrc: '/assets/recordings/multiplayer.webm',
    icon: '🤝',
    accentColor: '#38bdf8', // info blue
  },
  {
    id: 'environments',
    title: '3D Environments',
    subtitle: 'Immersive scenes.',
    description: 'HDRI lighting, GLB environments, post-processing effects, and animated backgrounds.',
    videoSrc: '/assets/recordings/environments.webm',
    icon: '🌌',
    accentColor: '#fbbf24', // warning yellow
  },
];

export const taglines = {
  main: 'Pose. Animate. Create.',
  sub: 'The browser-based VRM animation studio',
  cta: 'Try it free at poselab.studio',
};
```

---

## Animation Presets

Create `src/utils/animations.ts`:

```typescript
import { spring, SpringConfig } from 'remotion';

// Spring presets matching PoseLab's easing curves
export const springs = {
  snappy: {
    damping: 20,
    mass: 0.5,
    stiffness: 200,
  } satisfies SpringConfig,

  smooth: {
    damping: 30,
    mass: 1,
    stiffness: 100,
  } satisfies SpringConfig,

  bouncy: {
    damping: 12,
    mass: 0.8,
    stiffness: 180,
  } satisfies SpringConfig,

  gentle: {
    damping: 40,
    mass: 1.2,
    stiffness: 80,
  } satisfies SpringConfig,
} as const;

// Helper for common spring animation
export const springValue = (
  frame: number,
  fps: number,
  delay: number = 0,
  config: SpringConfig = springs.smooth
) => {
  return spring({
    frame: frame - delay,
    fps,
    config,
  });
};
```

---

## Key Components to Create

### 1. GlowBackground.tsx
Animated aurora mesh gradient background matching PoseLab's aesthetic.

```typescript
// Rough structure
export const GlowBackground: React.FC<{
  opacity?: number;
  animate?: boolean;
}> = ({ opacity = 1, animate = true }) => {
  // Render animated radial gradients
  // Use interpolate() to animate positions over time
  // Colors: cyan (#00ffd6), violet (#7c3aed), solar (#f97316)
};
```

### 2. DeviceMockup.tsx
Browser frame wrapper for screen recordings.

```typescript
export const DeviceMockup: React.FC<{
  children: React.ReactNode;
  scale?: number;
  shadow?: boolean;
}> = ({ children, scale = 1, shadow = true }) => {
  // Render a dark browser chrome frame
  // Traffic light buttons (red, yellow, green circles)
  // URL bar showing "poselab.studio"
  // Content area with children (video)
};
```

### 3. TextReveal.tsx
Animated text with character-by-character or word-by-word reveal.

```typescript
export const TextReveal: React.FC<{
  text: string;
  startFrame: number;
  style?: 'chars' | 'words' | 'lines';
  font?: 'display' | 'body';
}> = (props) => {
  // Split text and animate each part with staggered spring
};
```

### 4. FeatureCard.tsx
Animated card showing feature title, description, and accent glow.

```typescript
export const FeatureCard: React.FC<{
  feature: Feature;
  frame: number;
  fps: number;
}> = (props) => {
  // Glass card with accent border
  // Icon + title + subtitle
  // Animates in from side with spring
};
```

### 5. Logo.tsx
Animated PoseLab logo with glow effect.

```typescript
export const Logo: React.FC<{
  frame: number;
  fps: number;
  size?: number;
}> = (props) => {
  // SVG logo with animated glow
  // Scale in with spring
  // Subtle breathing animation
};
```

---

## Scene Templates

### IntroScene.tsx
```typescript
// 0-4 seconds
// - Black screen fade in
// - PoseLab logo scales in with glow
// - Tagline "Pose. Animate. Create." types in
// - Subtitle fades in below
```

### HeroScene.tsx
```typescript
// 4-12 seconds
// - Full app recording playing in DeviceMockup
// - Floating particles in background
// - Subtle camera zoom/pan on the mockup
```

### FeatureScene.tsx
```typescript
// Reusable for each feature (10 sec each)
// - Feature recording on one side (60% width)
// - FeatureCard on other side (40% width)
// - Accent glow matches feature color
// - Alternates left/right for visual variety
```

### CTAScene.tsx
```typescript
// 64-70 seconds
// - "Try it free" text
// - URL "poselab.studio" with glow
// - Animated arrow or click indicator
```

### OutroScene.tsx
```typescript
// 70-75 seconds
// - Project 89 logo fade in
// - PoseLab logo
// - Social handles (optional)
// - Fade to black
```

---

## Assets Checklist

Before rendering, capture these from PoseLab:

### Screen Recordings (1920x1080, 60fps, WebM VP9)
- [ ] `hero-loop.webm` - Full app overview, smooth interaction showcase (15-20 sec)
- [ ] `ai-pose-gen.webm` - Type prompt → pose generates (10-15 sec)
- [ ] `mocap-demo.webm` - Webcam on, calibrate, perform motion (15-20 sec)
- [ ] `manual-posing.webm` - Select bone, use gizmo, adjust pose (10-15 sec)
- [ ] `export-flow.webm` - Open export, select format, download (8-10 sec)
- [ ] `multiplayer.webm` - Create room, see sync happen (10-15 sec)
- [ ] `environments.webm` - Switch HDRIs, toggle effects, upload background (10-15 sec)

### Static Assets
- [ ] `poselab-logo.svg` - Main logo
- [ ] `project89-logo.svg` - Project 89 logo
- [ ] Avatar renders (PNG with transparency) for floating elements

### Audio
- [ ] `bgm.mp3` - Upbeat electronic/ambient track (royalty-free)
- [ ] `whoosh.mp3` - Transition sound
- [ ] `click.mp3` - UI interaction sound (optional)

### Fonts (self-host for Remotion)
- [ ] Orbitron (400, 600, 700, 900)
- [ ] Space Grotesk (400, 500, 600)
- [ ] JetBrains Mono (400, 500)

---

## Remotion Config

Create `remotion.config.ts`:

```typescript
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// For high-quality renders
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(18); // Lower = higher quality
```

---

## Composition Registration

Update `src/Root.tsx`:

```typescript
import { Composition } from 'remotion';
import { MainComposition } from './compositions/MainComposition';
import { TOTAL_DURATION, FPS } from './utils/timing';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main 16:9 composition */}
      <Composition
        id="MainComposition"
        component={MainComposition}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />

      {/* Vertical 9:16 for TikTok/Reels */}
      <Composition
        id="VerticalComposition"
        component={MainComposition}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ layout: 'vertical' }}
      />

      {/* Square 1:1 for Twitter/Instagram */}
      <Composition
        id="SquareComposition"
        component={MainComposition}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={1080}
        height={1080}
        defaultProps={{ layout: 'square' }}
      />
    </>
  );
};
```

---

## Render Commands

```bash
# Preview in browser
npm run dev

# Render 1080p MP4
npx remotion render src/index.ts MainComposition out/poselab-demo-1080p.mp4

# Render 4K (optional)
npx remotion render src/index.ts MainComposition out/poselab-demo-4k.mp4 --scale=2

# Render vertical for TikTok
npx remotion render src/index.ts VerticalComposition out/poselab-demo-vertical.mp4

# Render square for social
npx remotion render src/index.ts SquareComposition out/poselab-demo-square.mp4

# Render with custom frame range (for testing)
npx remotion render src/index.ts MainComposition out/test.mp4 --frames=0-90
```

---

## Style Notes

1. **Dark Mode Only**: All visuals should use the dark theme palette
2. **Accent Color**: Primary is aurora cyan `#00ffd6` with violet and solar as secondaries
3. **Typography**: Orbitron for headlines, Space Grotesk for body
4. **Glass Effect**: Use semi-transparent cards with blur for overlays
5. **Glow Effects**: Add subtle glows around interactive elements and text
6. **Motion**: Smooth springs (not linear), staggered reveals, breathing animations
7. **Consistency**: Match the feel of the actual PoseLab app

---

## References

- **PoseLab Live**: https://poselab.studio
- **Remotion Docs**: https://remotion.dev/docs
- **Design System Source**: `project89-reaction-forge/src/styles/design-system.css`
- **Design Tokens**: `project89-reaction-forge/tokens/tokens.json`

---

*This scaffold was generated for Project 89's PoseLab demo video. Pass this document to an AI agent in a fresh Remotion project to scaffold all files.*
