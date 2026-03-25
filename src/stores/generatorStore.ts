import { create } from 'zustand';
import type { ToneLevel, ConversationLength, Persona, GeneratedContent } from '../types';
import { generatorService } from '../services/generatorService';

interface GeneratorState {
  topic: string;
  tone: ToneLevel;
  length: ConversationLength;
  selectedPersonas: Persona[];
  output: GeneratedContent | null;
  isGenerating: boolean;
  error: string | null;
  setTopic: (topic: string) => void;
  setTone: (tone: ToneLevel) => void;
  setLength: (length: ConversationLength) => void;
  setSelectedPersonas: (personas: Persona[]) => void;
  generate: () => Promise<void>;
  reset: () => void;
}

export const useGeneratorStore = create<GeneratorState>((set, get) => ({
  topic: '',
  tone: 'balanced',
  length: 'medium',
  selectedPersonas: [],
  output: null,
  isGenerating: false,
  error: null,

  setTopic: (topic) => set({ topic }),
  setTone: (tone) => set({ tone }),
  setLength: (length) => set({ length }),
  setSelectedPersonas: (personas) => set({ selectedPersonas: personas }),

  generate: async () => {
    const { topic, tone, length, selectedPersonas } = get();
    if (!topic || selectedPersonas.length === 0) return;

    set({ isGenerating: true, error: null, output: null });
    try {
      const output = await generatorService.generateTalkShow({
        topic,
        tone,
        length,
        personas: selectedPersonas,
      });
      set({ output, isGenerating: false });
    } catch (err) {
      set({ error: (err as Error).message, isGenerating: false });
    }
  },

  reset: () =>
    set({
      topic: '',
      tone: 'balanced',
      length: 'medium',
      selectedPersonas: [],
      output: null,
      error: null,
    }),
}));
