import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VRMPose } from '@pixiv/three-vrm';

export interface CustomPose {
  id: string;
  name: string;
  description: string;
  poseData: {
    vrmPose: VRMPose;
  };
  createdAt: number;
}

interface CustomPoseState {
  // apiKey is no longer persisted in the store as it should come from .env
  customPoses: CustomPose[];
  addCustomPose: (pose: Omit<CustomPose, 'id' | 'createdAt'>) => void;
  removeCustomPose: (id: string) => void;
  updateCustomPose: (id: string, updates: Partial<CustomPose>) => void;
}

export const useCustomPoseStore = create<CustomPoseState>()(
  persist(
    (set) => ({
      customPoses: [],
      addCustomPose: (pose) => set((state) => ({
        customPoses: [
          ...state.customPoses,
          {
            ...pose,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
          },
        ],
      })),
      removeCustomPose: (id) => set((state) => ({
        customPoses: state.customPoses.filter((p) => p.id !== id),
      })),
      updateCustomPose: (id, updates) => set((state) => ({
        customPoses: state.customPoses.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      })),
    }),
    {
      name: 'reaction-forge-custom-poses',
    }
  )
);

