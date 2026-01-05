import { create } from 'zustand';

export const DEFAULT_VRM_URL = '/vrm/HarmonVox_519.vrm';

type AvatarSourceState = {
  currentUrl: string | null;
  sourceLabel: string;
  /** Original file data for VRM transfer in multiplayer */
  vrmArrayBuffer: ArrayBuffer | null;
  setRemoteUrl: (url: string, label?: string) => void;
  setFileSource: (file: File) => void;
  reset: () => void;
};

let objectUrlHandle: string | null = null;

const revokeObjectUrl = () => {
  if (objectUrlHandle) {
    URL.revokeObjectURL(objectUrlHandle);
    objectUrlHandle = null;
  }
};

export const useAvatarSource = create<AvatarSourceState>((set) => ({
  currentUrl: null, // Start with no avatar
  sourceLabel: 'No avatar loaded',
  vrmArrayBuffer: null,
  setRemoteUrl: (url, label = 'Remote VRM') => {
    revokeObjectUrl();
    // For remote URLs, fetch and store the ArrayBuffer
    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        set({ vrmArrayBuffer: buffer });
      })
      .catch(err => console.warn('[useAvatarSource] Failed to fetch VRM buffer:', err));
    
    set({
      currentUrl: url,
      sourceLabel: label,
    });
  },
  setFileSource: (file) => {
    revokeObjectUrl();
    objectUrlHandle = URL.createObjectURL(file);
    
    // Read and store the ArrayBuffer for multiplayer transfer
    file.arrayBuffer()
      .then(buffer => {
        set({ vrmArrayBuffer: buffer });
      })
      .catch(err => console.warn('[useAvatarSource] Failed to read VRM buffer:', err));
    
    set({
      currentUrl: objectUrlHandle,
      sourceLabel: file.name || 'Local VRM',
    });
  },
  reset: () => {
    revokeObjectUrl();
    set({
      currentUrl: null,
      sourceLabel: 'No avatar loaded',
      vrmArrayBuffer: null,
    });
  },
}));

