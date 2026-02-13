import { useSettingsStore } from '../state/useSettingsStore';
import { sceneManager } from '../three/sceneManager';

class PerformanceMonitor {
  private frameCount = 0;
  // private lastTime = 0;
  private isActive = false;
  private sampleDuration = 2000; // 2 seconds
  private sampleStartTime = 0;

  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.frameCount = 0;
    // this.lastTime = performance.now();
    this.sampleStartTime = performance.now();
    
    // Subscribe to scene tick
    this.cleanup = sceneManager.registerTick(() => this.tick());
    console.log('[PerfMonitor] Performance sampling started...');
  }

  private cleanup?: () => void;

  private tick() {
    if (!this.isActive) return;

    this.frameCount++;
    const now = performance.now();
    
    if (now - this.sampleStartTime >= this.sampleDuration) {
      this.analyze();
    }
  }

  private analyze() {
    const duration = performance.now() - this.sampleStartTime;
    const fps = Math.round((this.frameCount / duration) * 1000);
    
    console.log(`[PerfMonitor] Analysis complete: ${fps} FPS`);
    
    // Lower threshold for mobile (30fps is acceptable)
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.matchMedia('(pointer: coarse)').matches;
    const threshold = isMobile ? 30 : 40;
    
    if (fps < threshold) {
      console.warn('[PerfMonitor] Low performance detected. Downgrading settings.');
      const { setQuality, setShadows, quality } = useSettingsStore.getState();
      
      // Auto-downgrade
      // Only downgrade if we aren't already at low/medium
      if (quality !== 'low') {
          setQuality(quality === 'high' || quality === 'ultra' ? 'medium' : 'low');
      }
      setShadows(false);    // Disable shadows
      
      // Notify user via toast? (Optional, maybe too intrusive)
    } else {
        console.log('[PerfMonitor] Performance is optimal.');
    }

    this.stop();
  }

  stop() {
    this.isActive = false;
    if (this.cleanup) {
        this.cleanup();
        this.cleanup = undefined;
    }
  }
}

export const perfMonitor = new PerformanceMonitor();

