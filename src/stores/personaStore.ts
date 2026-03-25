import { create } from 'zustand';
import type { Persona, PersonalityTraits } from '../types';
import { personaService } from '../services/personaService';

interface PersonaState {
  personas: Persona[];
  isLoading: boolean;
  error: string | null;
  fetchPersonas: () => Promise<void>;
  createPersona: (name: string, traits: PersonalityTraits) => Promise<void>;
  updatePersona: (id: string, name: string, traits: PersonalityTraits) => Promise<void>;
  deletePersona: (id: string) => Promise<void>;
}

export const usePersonaStore = create<PersonaState>((set) => ({
  personas: [],
  isLoading: false,
  error: null,

  fetchPersonas: async () => {
    set({ isLoading: true, error: null });
    try {
      const personas = await personaService.getPersonas();
      set({ personas, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createPersona: async (name, traits) => {
    const persona = await personaService.createPersona(name, traits);
    set((state) => ({ personas: [...state.personas, persona] }));
  },

  updatePersona: async (id, name, traits) => {
    const updated = await personaService.updatePersona(id, name, traits);
    set((state) => ({
      personas: state.personas.map((p) => (p.id === id ? updated : p)),
    }));
  },

  deletePersona: async (id) => {
    await personaService.deletePersona(id);
    set((state) => ({ personas: state.personas.filter((p) => p.id !== id) }));
  },
}));
