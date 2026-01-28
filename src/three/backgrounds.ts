import * as THREE from 'three';
import type { BackgroundId } from '../types/reactions';
import { GifTexture } from './GifTexture';

type BackgroundDefinition = {
  id: BackgroundId;
  label: string;
  color: THREE.ColorRepresentation;
  image?: string; // Optional: path to background image
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// High-Resolution SVG Loader
// Renders SVGs to canvas at 4K resolution for crisp backgrounds
// ═══════════════════════════════════════════════════════════════════════════
const SVG_RENDER_WIDTH = 3840;  // 4K width
const SVG_RENDER_HEIGHT = 2160; // 4K height

async function loadSVGAsHighResTexture(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Create high-resolution canvas
      const canvas = document.createElement('canvas');
      canvas.width = SVG_RENDER_WIDTH;
      canvas.height = SVG_RENDER_HEIGHT;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw SVG scaled to fill canvas
      ctx.drawImage(img, 0, 0, SVG_RENDER_WIDTH, SVG_RENDER_HEIGHT);
      
      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false; // Not needed for backgrounds
      texture.needsUpdate = true;
      
      console.log(`[Background] SVG rendered at ${SVG_RENDER_WIDTH}x${SVG_RENDER_HEIGHT}:`, url);
      resolve(texture);
    };
    
    img.onerror = (error) => {
      reject(error);
    };
    
    img.src = url;
  });
}

const backgroundDefinitions: BackgroundDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // V2 Lightweight Vector Backgrounds (1-5KB each)
  // Brand-aligned with signal green (#00ffd6) and violet (#7c3aed)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'synthwave-grid',
    label: 'Synthwave Grid',
    color: '#030305',
    image: '/backgrounds/v2/synthwave-grid.svg',
  },
  {
    id: 'neural-circuit',
    label: 'Neural Circuit',
    color: '#030305',
    image: '/backgrounds/v2/neural-circuit.svg',
  },
  {
    id: 'neon-waves',
    label: 'Neon Waves',
    color: '#030305',
    image: '/backgrounds/v2/neon-waves.svg',
  },
  {
    id: 'quantum-particles',
    label: 'Quantum Particles',
    color: '#030305',
    image: '/backgrounds/v2/quantum-particles.svg',
  },
  {
    id: 'signal-glitch',
    label: 'Signal Glitch',
    color: '#050305',
    image: '/backgrounds/v2/signal-glitch.svg',
  },
  {
    id: 'cyber-hexagons',
    label: 'Cyber Hexagons',
    color: '#030305',
    image: '/backgrounds/v2/cyber-hexagons.svg',
  },
  {
    id: 'protocol-gradient',
    label: 'Protocol Gradient',
    color: '#030305',
    image: '/backgrounds/v2/protocol-gradient.svg',
  },
  {
    id: 'void-minimal',
    label: 'Void (Minimal)',
    color: '#030305',
    image: '/backgrounds/v2/void-minimal.svg',
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // Utility Backgrounds
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'green-screen',
    label: 'Green Screen',
    color: '#00ff00',
  },
];

// Cache loaded textures
const textureCache = new Map<string, THREE.Texture>();
const textureLoader = new THREE.TextureLoader();

export interface AnimatedBackground {
  texture: THREE.Texture;
  update: (delta: number) => void;
  dispose: () => void;
}

export function getBackgroundDefinition(id: BackgroundId | string): BackgroundDefinition {
  if (id.startsWith('blob:') || id.startsWith('data:')) {
    return {
      id: id as BackgroundId,
      label: 'Custom Background',
      color: '#000000',
      image: id
    };
  }
  return backgroundDefinitions.find((entry) => entry.id === id) ?? backgroundDefinitions[0];
}

export async function applyBackground(scene: THREE.Scene, id: BackgroundId | string): Promise<AnimatedBackground | null> {
  const definition = getBackgroundDefinition(id);
  
  // Note: We don't clear scene.environment here anymore, to allow mixing Backgrounds with HDRI lighting.

  // Try to load image if specified
  if (definition.image) {
    try {
      // Check for Custom Blob URL with Type Hint
      if (definition.image.startsWith('blob:') && definition.image.includes('#type=')) {
        const [url, typeParam] = definition.image.split('#type=');
        
        // Handle GIF
        if (typeParam.includes('gif')) {
           console.log('[Background] Detected GIF:', url);
           const gifTexture = new GifTexture();
           await gifTexture.load(url);
           scene.background = gifTexture.texture;
           
           return {
             texture: gifTexture.texture,
             update: (delta) => gifTexture.update(delta),
             dispose: () => gifTexture.dispose()
           };
        }
        
        // Handle Video
        if (typeParam.includes('video') || typeParam.includes('mp4') || typeParam.includes('webm')) {
           console.log('[Background] Detected Video:', url);
           const video = document.createElement('video');
           video.src = url;
           video.loop = true;
           video.muted = true;
           video.play().catch(e => console.warn('[Background] Video autoplay failed:', e));
           
           const videoTexture = new THREE.VideoTexture(video);
           videoTexture.colorSpace = THREE.SRGBColorSpace;
           scene.background = videoTexture;
           
           return {
             texture: videoTexture,
             update: () => {}, // VideoTexture updates automatically
             dispose: () => {
               video.pause();
               video.src = '';
               videoTexture.dispose();
             }
           };
        }
      }

      // Standard Image Loading
      let texture = textureCache.get(definition.image);
      
      if (!texture) {
        console.log('[Background] Loading image:', definition.image);
        
        // Use high-res SVG loader for SVG files
        const isSVG = definition.image.toLowerCase().endsWith('.svg');
        
        if (isSVG) {
          texture = await loadSVGAsHighResTexture(definition.image);
        } else {
          texture = await new Promise<THREE.Texture>((resolve, reject) => {
            textureLoader.load(
              definition.image!,
              (loadedTexture) => {
                loadedTexture.colorSpace = THREE.SRGBColorSpace;
                resolve(loadedTexture);
              },
              undefined,
              (error) => {
                console.warn('[Background] Failed to load image:', definition.image, error);
                reject(error);
              }
            );
          });
        }
        
        textureCache.set(definition.image, texture);
      }
      
      scene.background = texture;
      console.log('[Background] Applied image:', definition.image);
      return null;
    } catch (error) {
      console.warn('[Background] Image load failed, using color fallback', error);
    }
  }
  
  // Fallback to solid color
  scene.background = new THREE.Color(definition.color);
  console.log('[Background] Applied color:', definition.color);
  return null;
}

export const backgroundOptions = backgroundDefinitions;
