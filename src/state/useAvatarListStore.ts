import { create } from 'zustand';

export type AvatarEntry = {
  id: string;
  name: string;
  description: string;
  model_file_url: string;
  format: string;
  thumbnail_url: string;
  metadata?: {
    number?: string;
    series?: string;
  };
};

type AvatarListState = {
  avatars: AvatarEntry[];
  isLoading: boolean;
  error: string | null;
  fetchAvatars: () => Promise<void>;
  getRandomAvatar: () => AvatarEntry | null;
};

const AVATAR_LIST_URL = 'https://raw.githubusercontent.com/ToxSam/open-source-avatars/main/data/avatars.json';

export const useAvatarListStore = create<AvatarListState>((set, get) => ({
  avatars: [],
  isLoading: false,
  error: null,
  fetchAvatars: async () => {
    // If already loaded, don't fetch again
    if (get().avatars.length > 0) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(AVATAR_LIST_URL);
      if (!response.ok) throw new Error('Failed to fetch avatar list');
      const data = await response.json();
      
      // Filter for VRM avatars only just in case
      const vrmAvatars = Array.isArray(data) 
        ? data.filter((a: any) => a.format === 'VRM' && a.model_file_url)
        : [];
        
      set({ avatars: vrmAvatars, isLoading: false });
    } catch (err) {
      console.error('Error fetching avatars:', err);
      set({ error: (err as Error).message, isLoading: false });
    }
  },
  getRandomAvatar: () => {
    const { avatars } = get();
    if (avatars.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * avatars.length);
    return avatars[randomIndex];
  }
}));
