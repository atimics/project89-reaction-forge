import * as THREE from 'three';
import type { VRM } from '@pixiv/three-vrm';
import { getPoseDefinitionWithAnimation } from '../poses';
import { retargetAnimationClip } from '../poses/animationClipSerializer';
import { useToastStore } from '../state/useToastStore';

class AnimationManager {
  private mixer?: THREE.AnimationMixer;
  private currentAction?: THREE.AnimationAction;
  private vrm?: VRM;

  initialize(vrm: VRM) {
    console.log('[AnimationManager] Initializing with VRM');
    this.cleanup();
    this.vrm = vrm;
    this.mixer = new THREE.AnimationMixer(vrm.scene);
    this.mixer.addEventListener('finished', this.handleAnimationFinished.bind(this));
  }

  private async handleAnimationFinished(event: { action: THREE.AnimationAction }) {
    // Ignore the idle animation finishing itself
    if (event.action.getClip().name === 'idle-neutral-animation') {
      return;
    }

    // Only handle animations that are meant to play once
    const isLooping = event.action.loop === THREE.LoopRepeat;
    if (isLooping) return;
    
    console.log(`[AnimationManager] FLAG: Non-looping animation finished: "${event.action.getClip().name}". Attempting to transition to idle.`);
    
    try {
      // Smoothly transition to a default idle animation
      const idleDef = await getPoseDefinitionWithAnimation('idle-neutral', this.vrm);
      if (idleDef?.animationClip && this.vrm) {
        console.log('[AnimationManager] Found "idle-neutral" animation definition. Retargeting and playing.');
        const idleClip = retargetAnimationClip(idleDef.animationClip, this.vrm, {});
        // Use a longer fade-in (0.5s) for a smoother transition from a held pose
        this.playAnimation(idleClip, true, 0.5);
        console.log('[AnimationManager] FLAG: Successfully started transition to "idle-neutral-animation".');
      } else {
        console.error('[AnimationManager] FLAG: FAILED to find "idle-neutral" animation definition. Avatar may T-pose.');
        useToastStore.getState().addToast('Fallback idle animation not found.', 'error');
      }
    } catch (error) {
      console.error('[AnimationManager] FLAG: CRITICAL error during transition to idle. Avatar may T-pose.', error);
      useToastStore.getState().addToast('Error transitioning to idle.', 'error');
    }
  }

  playAnimation(clip: THREE.AnimationClip, loop = true, fadeInDuration = 0.3) {
    if (!this.mixer || !this.vrm) {
      console.warn('[AnimationManager] Cannot play animation - mixer not initialized');
      return;
    }

    console.log('[AnimationManager] Playing animation:', clip.name, { loop, duration: clip.duration, tracks: clip.tracks.length });

    const previousAction = this.currentAction;
    const newAction = this.mixer.clipAction(clip);

    newAction.reset();
    newAction.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    newAction.clampWhenFinished = !loop;
    newAction.enabled = true;

    if (previousAction && previousAction !== newAction) {
      previousAction.fadeOut(fadeInDuration);
    }

    newAction.setEffectiveWeight(1.0);
    newAction.fadeIn(fadeInDuration);
    newAction.play();

    this.currentAction = newAction;
    
    console.log('[AnimationManager] ✅ Animation started:', {
      name: clip.name,
      isRunning: newAction.isRunning(),
    });
  }

  /**
   * Stop the current animation
   * @param immediate - If true, stop immediately without fade (default: true for static poses)
   * @param resetPose - If true, reset to T-pose after stopping (default: false)
   */
  stopAnimation(immediate = true, resetPose = false) {
    if (!this.mixer) return;
    
    console.log('[AnimationManager] Stopping animation', { immediate, resetPose });
    
    if (this.currentAction) {
      if (immediate) {
        this.currentAction.stop();
      } else {
        this.currentAction.fadeOut(0.3);
      }
      this.currentAction = undefined;
    }
    
    // Stop all actions to ensure clean state
    if (immediate) {
      this.mixer.stopAllAction();
    }
    
    // Only reset to T-pose if explicitly requested
    // This prevents unwanted snapping when transitioning between animations
    if (resetPose && this.vrm?.humanoid) {
      this.vrm.humanoid.resetNormalizedPose();
      this.vrm.update(0);
      console.log('[AnimationManager] Reset VRM to T-pose');
    }
  }

  /**
   * Update the animation mixer (call this in your render loop)
   * @param delta - Time delta in seconds
   */
  update(delta: number) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }

  /**
   * Check if an animation is currently playing
   */
  isPlaying(): boolean {
    return this.currentAction?.isRunning() ?? false;
  }

  /**
   * Get the current animation progress (0-1)
   */
  getProgress(): number {
    if (!this.currentAction) return 0;
    const clip = this.currentAction.getClip();
    return clip.duration > 0 ? this.currentAction.time / clip.duration : 0;
  }

  /**
   * Set the loop mode of the current animation
   */
  setLoop(loop: boolean) {
    if (this.currentAction) {
      this.currentAction.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    }
  }

  /**
   * Set the playback speed of the current animation
   */
  setSpeed(speed: number) {
    if (this.currentAction) {
      this.currentAction.timeScale = speed;
    }
  }

  /**
   * Seek to a specific time in the current animation
   */
  seek(time: number) {
    if (this.currentAction && this.mixer) {
      this.currentAction.time = time;
      // Force mixer to update visual state immediately
      this.mixer.update(0);
    }
  }

  /**
   * Pause the current animation
   */
  pause() {
    if (this.currentAction) {
      this.currentAction.paused = true;
    }
  }

  /**
   * Resume the current animation
   */
  resume() {
    if (this.currentAction) {
      this.currentAction.paused = false;
    }
  }

  /**
   * Play a transition clip once and call onComplete when finished
   * Used for smooth pose-to-pose transitions
   */
  playTransition(clip: THREE.AnimationClip, onComplete?: () => void) {
    if (!this.mixer || !this.vrm) {
      console.warn('[AnimationManager] Cannot play transition - mixer not initialized');
      onComplete?.();
      return;
    }

    console.log('[AnimationManager] Playing transition:', clip.name, { duration: clip.duration, tracks: clip.tracks.length });

    // Stop any current animation
    if (this.currentAction) {
      this.currentAction.stop();
      this.currentAction = undefined;
    }
    this.mixer.stopAllAction();

    // Create and configure transition action
    const action = this.mixer.clipAction(clip);
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.enabled = true;
    action.setEffectiveWeight(1);
    action.setEffectiveTimeScale(1);
    action.play();

    this.currentAction = action;

    // Listen for completion
    const handleFinished = (event: { action: THREE.AnimationAction }) => {
      if (event.action === action) {
        this.mixer?.removeEventListener('finished', handleFinished);
        console.log('[AnimationManager] Transition complete');
        onComplete?.();
      }
    };
    this.mixer.addEventListener('finished', handleFinished);
  }

  /**
   * Play a transition clip, then crossfade to target clip
   */
  playTransitionAndFade(fromClip: THREE.AnimationClip, toClip: THREE.AnimationClip, loop = true, duration = 0.5) {
     if (!this.mixer) return;
     
     // 1. Play "from" clip (Current Pose)
     // We use a separate action to ensure it doesn't get messed up
     const fromAction = this.mixer.clipAction(fromClip);
     fromAction.reset();
     fromAction.setLoop(THREE.LoopOnce, 1);
     fromAction.clampWhenFinished = true;
     fromAction.play();
     fromAction.weight = 1;
     
     // 2. Play "to" clip (Target Animation)
     const toAction = this.mixer.clipAction(toClip);
     toAction.reset();
     toAction.enabled = true; // Ensure it is enabled
     toAction.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
     toAction.clampWhenFinished = !loop;
     toAction.play();
     toAction.weight = 0;
     
     // 3. Crossfade
     // warp=false to avoid timescale distortion between static pose (0.1s) and animation
     fromAction.crossFadeTo(toAction, duration, false);
     
     // Update current action tracker
     this.currentAction = toAction;
  }

  /**
   * Get the current action (for external access if needed)
   */
  getCurrentAction(): THREE.AnimationAction | undefined {
    return this.currentAction;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    console.log('[AnimationManager] Cleaning up');
    if (this.currentAction) {
      this.currentAction.stop();
      this.currentAction = undefined;
    }
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = undefined;
    }
    this.vrm = undefined;
  }
}

export const animationManager = new AnimationManager();

