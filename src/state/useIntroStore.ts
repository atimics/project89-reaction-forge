/**
 * Intro Store - Settings and state for the opening sequence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IntroState {
  /** Whether intro sequence is enabled */
  enabled: boolean;
  /** Current sequence ID */
  sequenceId: string;
  /** Whether to auto-capture at key moments */
  autoCapture: boolean;
  /** Whether currently playing */
  isPlaying: boolean;
  /** Random snapshot interval (0 = disabled, otherwise seconds) */
  randomSnapshotInterval: number;
  /** Auto-captured images from intro/random */
  autoCaptures: string[];
  /** Max auto-captures to keep */
  maxAutoCaptures: number;
  
  // Actions
  setEnabled: (enabled: boolean) => void;
  setSequenceId: (id: string) => void;
  setAutoCapture: (enabled: boolean) => void;
  setPlaying: (playing: boolean) => void;
  setRandomSnapshotInterval: (seconds: number) => void;
  addAutoCapture: (dataUrl: string) => void;
  clearAutoCaptures: () => void;
  downloadAutoCapture: (index: number) => void;
}

export const useIntroStore = create<IntroState>()(
  persist(
    (set, get) => ({
      enabled: true,
      sequenceId: 'sunset-showcase',
      autoCapture: false,
      isPlaying: false,
      randomSnapshotInterval: 0,
      autoCaptures: [],
      maxAutoCaptures: 10,

      setEnabled: (enabled) => set({ enabled }),
      
      setSequenceId: (sequenceId) => set({ sequenceId }),
      
      setAutoCapture: (autoCapture) => set({ autoCapture }),
      
      setPlaying: (isPlaying) => set({ isPlaying }),
      
      setRandomSnapshotInterval: (randomSnapshotInterval) => set({ randomSnapshotInterval }),
      
      addAutoCapture: (dataUrl) => {
        const { autoCaptures, maxAutoCaptures } = get();
        const updated = [...autoCaptures, dataUrl].slice(-maxAutoCaptures);
        set({ autoCaptures: updated });
      },
      
      clearAutoCaptures: () => set({ autoCaptures: [] }),
      
      downloadAutoCapture: (index) => {
        const { autoCaptures } = get();
        const dataUrl = autoCaptures[index];
        if (!dataUrl) return;
        
        const link = document.createElement('a');
        link.download = `poselab-auto-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      },
    }),
    {
      name: 'poselab-intro-settings',
      partialize: (state) => ({
        enabled: state.enabled,
        sequenceId: state.sequenceId,
        autoCapture: state.autoCapture,
        randomSnapshotInterval: state.randomSnapshotInterval,
      }),
    }
  )
);

