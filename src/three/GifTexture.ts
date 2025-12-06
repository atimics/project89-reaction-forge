import * as THREE from 'three';
import { parseGIF, decompressFrames } from 'gifuct-js';

export class GifTexture {
  texture: THREE.CanvasTexture;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private frames: any[] = [];
  private frameIndex = 0;
  private timeAccumulator = 0;
  private isPlaying = false;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 2;
    this.canvas.height = 2;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Create a placeholder texture initially
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, 2, 2);
    
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.colorSpace = THREE.SRGBColorSpace;
  }

  async load(url: string) {
    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const gif = parseGIF(buffer);
      this.frames = decompressFrames(gif, true);

      if (this.frames.length > 0) {
        // Set canvas size to match GIF
        const width = this.frames[0].dims.width;
        const height = this.frames[0].dims.height;
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Render first frame
        this.renderFrame(0);
        this.isPlaying = true;
      }
    } catch (error) {
      console.error('Failed to load GIF:', error);
    }
  }

  private renderFrame(index: number) {
    if (index < 0 || index >= this.frames.length) return;

    const frame = this.frames[index];
    const imageData = new ImageData(
      new Uint8ClampedArray(frame.patch),
      frame.dims.width,
      frame.dims.height
    );

    // Draw the patch
    // Note: gifuct-js gives us patches, sometimes partial. 
    // If disposalType is 2 (restore to background), we clear.
    // However, for simplicity with 'drawPatch', we might need to handle disposal.
    // But decompressFrames(gif, true) (the 'buildImagePatches' arg) 
    // constructs full frames if I recall correctly? 
    // Checking docs: decompressFrames(gif, buildPatch) -> if buildPatch is true, it parses patches.
    // Actually, handling raw GIF disposal is complex.
    // Let's assume standard full-frame or draw-over behavior for now.
    
    // Create a temp canvas to put the patch on
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = frame.dims.width;
    tempCanvas.height = frame.dims.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx?.putImageData(imageData, 0, 0);

    // Draw to main canvas
    // We need to handle offsets
    this.ctx.drawImage(tempCanvas, frame.dims.left, frame.dims.top);
    
    this.texture.needsUpdate = true;
  }

  update(delta: number) {
    if (!this.isPlaying || this.frames.length === 0) return;

    this.timeAccumulator += delta * 1000; // Convert to ms

    const currentFrame = this.frames[this.frameIndex];
    const delay = currentFrame.delay || 100; // Default 100ms if not specified

    if (this.timeAccumulator >= delay) {
      this.timeAccumulator -= delay;
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
      
      // Handle disposal of previous frame if needed (simplification: just draw over)
      // For proper GIF rendering we usually need a cumulative buffer.
      // Since we are drawing to the same canvas context, we are essentially compositing.
      // If disposal type was 'restore to background' (2), we'd need to clear.
      // But let's see how it looks.
      
      const prevFrameIndex = (this.frameIndex - 1 + this.frames.length) % this.frames.length;
      const prevFrame = this.frames[prevFrameIndex];
      
      if (prevFrame.disposalType === 2) {
          this.ctx.clearRect(prevFrame.dims.left, prevFrame.dims.top, prevFrame.dims.width, prevFrame.dims.height);
      }
      
      this.renderFrame(this.frameIndex);
    }
  }

  dispose() {
    this.isPlaying = false;
    this.texture.dispose();
  }
}

