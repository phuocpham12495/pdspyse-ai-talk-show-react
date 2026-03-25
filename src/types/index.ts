export interface User {
  id: string;
  email: string;
  avatar_url: string | null;
  date_of_birth: string | null;
  app_settings: Record<string, unknown> | null;
  created_at: string;
}

export interface Persona {
  id: string;
  user_id: string | null;
  name: string;
  personality_traits: PersonalityTraits;
  created_at: string;
  is_default: boolean;
}

export interface PersonalityTraits {
  tone: string;
  style: string;
  description?: string;
  keywords?: string[];
}

export type ToneLevel = 'light' | 'balanced' | 'deep debate';
export type ConversationLength = 'short' | 'medium' | 'long';
export type Mood = 'funny' | 'serious' | 'controversial' | 'thought-provoking' | 'casual';

export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface GeneratedContent {
  intro: string;
  discussion: DialogueLine[];
  highlights: string[];
  summary: string;
}

export interface Episode {
  id: string;
  user_id: string;
  topic: string;
  tone_level: ToneLevel;
  conversation_length: ConversationLength;
  generated_content: GeneratedContent;
  mood: Mood | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  likes_count?: number;
  comments_count?: number;
  user?: Pick<User, 'id' | 'email' | 'avatar_url'>;
}

export interface Tag {
  id: string;
  name: string;
}

export interface EpisodeTag {
  episode_id: string;
  tag_id: string;
}

export interface Like {
  id: string;
  episode_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  episode_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: Pick<User, 'id' | 'email' | 'avatar_url'>;
}

export interface GenerateRequest {
  topic: string;
  tone: ToneLevel;
  length: ConversationLength;
  personas: Persona[];
}

export interface EpisodeFilters {
  tags: string[];
  mood: Mood | null;
}

export type SortField = 'topic' | 'created_at';
export type SortOrder = 'asc' | 'desc';
