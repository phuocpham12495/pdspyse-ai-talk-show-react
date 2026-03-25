import { create } from 'zustand';
import type { Episode, Comment } from '../types';
import { episodeService } from '../services/episodeService';
import { socialService } from '../services/socialService';

interface FeedState {
  publicEpisodes: Episode[];
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  fetchPublicFeed: () => Promise<void>;
  toggleLike: (episodeId: string) => Promise<boolean>;
  fetchComments: (episodeId: string) => Promise<void>;
  addComment: (episodeId: string, content: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
}

export const useFeedStore = create<FeedState>((set) => ({
  publicEpisodes: [],
  comments: [],
  isLoading: false,
  error: null,

  fetchPublicFeed: async () => {
    set({ isLoading: true, error: null });
    try {
      const episodes = await episodeService.getPublicEpisodes();
      set({ publicEpisodes: episodes, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  toggleLike: async (episodeId) => {
    return await socialService.toggleLike(episodeId);
  },

  fetchComments: async (episodeId) => {
    try {
      const comments = await socialService.getComments(episodeId);
      set({ comments });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  addComment: async (episodeId, content) => {
    const comment = await socialService.addComment(episodeId, content);
    set((state) => ({ comments: [...state.comments, comment] }));
  },

  deleteComment: async (id) => {
    await socialService.deleteComment(id);
    set((state) => ({ comments: state.comments.filter((c) => c.id !== id) }));
  },
}));
