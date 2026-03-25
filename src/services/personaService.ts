import { supabase } from '../lib/supabase';
import type { Persona, PersonalityTraits } from '../types';

export const personaService = {
  async getPersonas(): Promise<Persona[]> {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createPersona(name: string, traits: PersonalityTraits): Promise<Persona> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('personas')
      .insert({
        user_id: userData.user.id,
        name,
        personality_traits: traits,
        is_default: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePersona(id: string, name: string, traits: PersonalityTraits): Promise<Persona> {
    const { data, error } = await supabase
      .from('personas')
      .update({ name, personality_traits: traits })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePersona(id: string): Promise<void> {
    const { error } = await supabase.from('personas').delete().eq('id', id);
    if (error) throw error;
  },
};
