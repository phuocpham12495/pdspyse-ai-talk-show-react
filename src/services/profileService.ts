import { supabase } from '../lib/supabase';
import type { User } from '../types';

export const profileService = {
  async getProfile(): Promise<User | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(updates: {
    date_of_birth?: string;
    app_settings?: Record<string, unknown>;
  }): Promise<User> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userData.user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadAvatar(file: File): Promise<string> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const filePath = `${userData.user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    await supabase
      .from('users')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', userData.user.id);

    return urlData.publicUrl;
  },
};
