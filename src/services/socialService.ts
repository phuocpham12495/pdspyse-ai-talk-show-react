import { supabase } from '../lib/supabase';
import type { Comment } from '../types';

export const socialService = {
  async toggleLike(episodeId: string): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('episode_id', episodeId)
      .eq('user_id', userData.user.id)
      .single();

    if (existing) {
      await supabase.from('likes').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase
        .from('likes')
        .insert({ episode_id: episodeId, user_id: userData.user.id });
      return true;
    }
  },

  async getLikesCount(episodeId: string): Promise<number> {
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('episode_id', episodeId);

    if (error) throw error;
    return count || 0;
  },

  async hasLiked(episodeId: string): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;

    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('episode_id', episodeId)
      .eq('user_id', userData.user.id)
      .single();

    return !!data;
  },

  async getComments(episodeId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*, users(id, email, avatar_url)')
      .eq('episode_id', episodeId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map((c) => ({
      ...c,
      user: c.users || undefined,
    }));
  },

  async addComment(episodeId: string, content: string): Promise<Comment> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        episode_id: episodeId,
        user_id: userData.user.id,
        content,
      })
      .select('*, users(id, email, avatar_url)')
      .single();

    if (error) throw error;
    return { ...data, user: data.users || undefined };
  },

  async deleteComment(id: string): Promise<void> {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) throw error;
  },
};
