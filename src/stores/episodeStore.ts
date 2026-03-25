import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Episode, EpisodeFilters, SortField, SortOrder, Mood } from '../types';
import { episodeService } from '../services/episodeService';

interface EpisodeState {
  episodes: Episode[];
  currentEpisode: Episode | null;
  filters: EpisodeFilters;
  sortField: SortField;
  sortOrder: SortOrder;
  isLoading: boolean;
  error: string | null;
  fetchEpisodes: () => Promise<void>;
  fetchEpisodeById: (id: string) => Promise<void>;
  deleteEpisode: (id: string) => Promise<void>;
  setFilterTags: (tags: string[]) => void;
  setFilterMood: (mood: Mood | null) => void;
  setSort: (field: SortField, order: SortOrder) => void;
}

export const useEpisodeStore = create<EpisodeState>()(persist((set, get) => ({
  episodes: [],
  currentEpisode: null,
  filters: { tags: [], mood: null },
  sortField: 'created_at',
  sortOrder: 'desc',
  isLoading: false,
  error: null,

  fetchEpisodes: async () => {
    const { filters, sortField, sortOrder } = get();
    set({ isLoading: true, error: null });
    try {
      const episodes = await episodeService.getEpisodes(filters, sortField, sortOrder);
      set({ episodes, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchEpisodeById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const episode = await episodeService.getEpisodeById(id);
      set({ currentEpisode: episode, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  deleteEpisode: async (id) => {
    await episodeService.deleteEpisode(id);
    set((state) => ({
      episodes: state.episodes.filter((ep) => ep.id !== id),
    }));
  },

  setFilterTags: (tags) => set((state) => ({ filters: { ...state.filters, tags } })),
  setFilterMood: (mood) => set((state) => ({ filters: { ...state.filters, mood } })),
  setSort: (field, order) => set({ sortField: field, sortOrder: order }),
}), {
  name: 'episode-store',
  partialize: (state) => ({
    episodes: state.episodes,
    currentEpisode: state.currentEpisode,
  }),
}));
