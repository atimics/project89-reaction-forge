import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Track {
  id: string;
  title: string;
  url: string;
  isLocal: boolean;
  file?: File;
}

interface MusicState {
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  
  // Actions
  setTracks: (tracks: Track[]) => void;
  addTracks: (tracks: Track[]) => void;
  playTrack: (index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  clearPlaylist: () => void;
}

export const useMusicStore = create<MusicState>()(
  persist(
    (set, get) => ({
      tracks: [],
      currentTrackIndex: 0,
      isPlaying: false,
      volume: 0.5,
      isMuted: false,

      setTracks: (tracks) => set({ tracks, currentTrackIndex: 0, isPlaying: true }),
      
      addTracks: (newTracks) => set((state) => ({ 
        tracks: [...state.tracks, ...newTracks],
        // If nothing was playing, start playing the first new track
        isPlaying: state.tracks.length === 0 ? true : state.isPlaying
      })),

      playTrack: (index) => {
        const { tracks } = get();
        if (index >= 0 && index < tracks.length) {
          set({ currentTrackIndex: index, isPlaying: true });
        }
      },

      nextTrack: () => {
        const { tracks, currentTrackIndex } = get();
        if (tracks.length === 0) return;
        const nextIndex = (currentTrackIndex + 1) % tracks.length;
        set({ currentTrackIndex: nextIndex });
      },

      prevTrack: () => {
        const { tracks, currentTrackIndex } = get();
        if (tracks.length === 0) return;
        const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        set({ currentTrackIndex: prevIndex });
      },

      setIsPlaying: (isPlaying) => set({ isPlaying }),
      
      setVolume: (volume) => set({ volume }),
      
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      clearPlaylist: () => set({ tracks: [], currentTrackIndex: 0, isPlaying: false }),
    }),
    {
      name: 'poselab-music-storage',
      // Only persist volume settings, not the playlist (since local files won't persist well)
      partialize: (state) => ({ 
        volume: state.volume, 
        isMuted: state.isMuted 
      }),
    }
  )
);
