/**
 * Session Store - UI state for multiplayer social features
 */

import { create } from 'zustand';
import type { ReactionType } from '../types/multiplayer';

export interface ChatMessage {
  id: string;
  peerId: string;
  displayName: string;
  text: string;
  timestamp: number;
  isLocal: boolean;
}

export interface ReactionBubble {
  id: string;
  peerId: string;
  displayName: string;
  reaction: ReactionType;
  emoji: string;
  timestamp: number;
}

interface SessionState {
  // Chat
  chatMessages: ChatMessage[];
  isChatOpen: boolean;
  unreadCount: number;
  
  // Reactions
  reactionBubbles: ReactionBubble[];
  
  // Group Photo
  isCountdownActive: boolean;
  countdownValue: number;
  lastPhotoUrl: string | null;
  showPhotoPreview: boolean;
  
  // UI State
  showParticipants: boolean;
  showReactionPicker: boolean;
  
  // Actions
  addChatMessage: (message: ChatMessage) => void;
  setChatOpen: (open: boolean) => void;
  clearUnread: () => void;
  
  addReaction: (reaction: ReactionBubble) => void;
  removeReaction: (id: string) => void;
  
  setCountdown: (active: boolean, value?: number) => void;
  setLastPhoto: (url: string | null) => void;
  setShowPhotoPreview: (show: boolean) => void;
  
  setShowParticipants: (show: boolean) => void;
  setShowReactionPicker: (show: boolean) => void;
  
  resetSession: () => void;
}

const initialState = {
  chatMessages: [],
  isChatOpen: false,
  unreadCount: 0,
  reactionBubbles: [],
  isCountdownActive: false,
  countdownValue: 0,
  lastPhotoUrl: null,
  showPhotoPreview: false,
  showParticipants: false,
  showReactionPicker: false,
};

export const useSessionStore = create<SessionState>((set, get) => ({
  ...initialState,

  addChatMessage: (message) => {
    set((state) => ({
      chatMessages: [...state.chatMessages.slice(-99), message], // Keep last 100
      unreadCount: state.isChatOpen ? 0 : state.unreadCount + (message.isLocal ? 0 : 1),
    }));
  },

  setChatOpen: (open) => {
    set({ isChatOpen: open, unreadCount: open ? 0 : get().unreadCount });
  },

  clearUnread: () => {
    set({ unreadCount: 0 });
  },

  addReaction: (reaction) => {
    set((state) => ({
      reactionBubbles: [...state.reactionBubbles, reaction],
    }));

    // Auto-remove after 3 seconds
    setTimeout(() => {
      get().removeReaction(reaction.id);
    }, 3000);
  },

  removeReaction: (id) => {
    set((state) => ({
      reactionBubbles: state.reactionBubbles.filter((r) => r.id !== id),
    }));
  },

  setCountdown: (active, value = 3) => {
    set({ isCountdownActive: active, countdownValue: value });
  },

  setLastPhoto: (url) => {
    set({ lastPhotoUrl: url });
  },

  setShowPhotoPreview: (show) => {
    set({ showPhotoPreview: show });
  },

  setShowParticipants: (show) => {
    set({ showParticipants: show });
  },

  setShowReactionPicker: (show) => {
    set({ showReactionPicker: show });
  },

  resetSession: () => {
    set(initialState);
  },
}));

