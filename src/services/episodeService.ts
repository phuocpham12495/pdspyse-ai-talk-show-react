import { supabase } from '../lib/supabase';
import type { Episode, EpisodeFilters, SortField, SortOrder, Mood, ToneLevel, ConversationLength, GeneratedContent } from '../types';

export const episodeService = {
  async getEpisodes(
    filters: EpisodeFilters,
    sortField: SortField = 'created_at',
    sortOrder: SortOrder = 'desc'
  ): Promise<Episode[]> {
    let query = supabase
      .from('episodes')
      .select('*, episode_tags(tag_id, tags(id, name))')
      .order(sortField, { ascending: sortOrder === 'asc' });

    if (filters.mood) {
      query = query.eq('mood', filters.mood);
    }

    const { data, error } = await query;
    if (error) throw error;

    let episodes = (data || []).map(mapEpisode);

    if (filters.tags.length > 0) {
      episodes = episodes.filter((ep) =>
        ep.tags?.some((tag) => filters.tags.includes(tag.name))
      );
    }

    return episodes;
  },

  async getEpisodeById(id: string): Promise<Episode> {
    const { data, error } = await supabase
      .from('episodes')
      .select('*, episode_tags(tag_id, tags(id, name))')
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapEpisode(data);
  },

  async saveEpisode(episode: {
    topic: string;
    tone_level: ToneLevel;
    conversation_length: ConversationLength;
    generated_content: GeneratedContent;
    mood: Mood | null;
    tags: string[];
    is_public?: boolean;
  }): Promise<Episode> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('episodes')
      .insert({
        user_id: userData.user.id,
        topic: episode.topic,
        tone_level: episode.tone_level,
        conversation_length: episode.conversation_length,
        generated_content: episode.generated_content,
        mood: episode.mood,
        is_public: episode.is_public || false,
      })
      .select()
      .single();

    if (error) throw error;

    if (episode.tags.length > 0) {
      for (const tagName of episode.tags) {
        const { data: tagData } = await supabase
          .from('tags')
          .upsert({ name: tagName }, { onConflict: 'name' })
          .select()
          .single();

        if (tagData) {
          await supabase
            .from('episode_tags')
            .insert({ episode_id: data.id, tag_id: tagData.id });
        }
      }
    }

    return mapEpisode(data);
  },

  async deleteEpisode(id: string): Promise<void> {
    const { error } = await supabase.from('episodes').delete().eq('id', id);
    if (error) throw error;
  },

  async getPublicEpisodes(): Promise<Episode[]> {
    const { data, error } = await supabase
      .from('episodes')
      .select('*, episode_tags(tag_id, tags(id, name)), users(id, email, avatar_url)')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapEpisode);
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEpisode(raw: any): Episode {
  const tags = raw.episode_tags
    ?.map((et: { tags: { id: string; name: string } }) => et.tags)
    .filter(Boolean) || [];

  return {
    ...raw,
    tags,
    user: raw.users || undefined,
  };
}
