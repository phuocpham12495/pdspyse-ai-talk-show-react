import { supabase } from '../lib/supabase';
import type { GenerateRequest, GeneratedContent } from '../types';

export const generatorService = {
  async generateTalkShow(request: GenerateRequest): Promise<GeneratedContent> {
    const { data, error } = await supabase.functions.invoke('generate-talk-show', {
      body: {
        topic: request.topic,
        tone: request.tone,
        length: request.length,
        personas: request.personas.map((p) => ({
          name: p.name,
          personality_traits: p.personality_traits,
        })),
      },
    });

    if (error) throw error;
    return data as GeneratedContent;
  },
};
