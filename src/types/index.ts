// ==============================================================================
// STREETLIFE — TIPOS E INTERFACES TYPESCRIPT
// ==============================================================================

export type BattleStatus = 'draft' | 'active' | 'voting' | 'completed';

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  instagram: string | null;
  created_at: string;
  updated_at: string;
}

export interface Battle {
  id: string;
  edition_number: number;
  title: string;
  theme: string;
  description: string | null;
  cover_image_url: string | null;
  status: BattleStatus;
  start_date: string | null;
  end_date: string | null;
  prize_info: string | null;
  rules: string | null;
  created_at: string;
  updated_at: string;
  results?: BattleResult[];
  looks_count?: number;
}

export interface LookPiece {
  brand: string;
  item: string;
}

export interface Look {
  id: string;
  user_id: string | null;
  battle_id: string | null;
  participant_name: string;
  title: string;
  description: string | null;
  image_url: string;
  style_tags: string[];
  pieces: LookPiece[];
  votes_count: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  battle?: Battle;
}

export interface BattleResult {
  id: string;
  battle_id: string;
  placement: 1 | 2 | 3;
  participant_name: string;
  look_id: string | null;
  look_title: string | null;
  look_image_url: string;
  custom_notes: string | null;
  created_at: string;
  battle?: Battle;
}

export interface LookOfTheWeek {
  id: string;
  look_id: string | null;
  title: string;
  author_name: string;
  image_url: string;
  curator_comment: string;
  highlight_period: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserNotification {
  id: string;
  user_id: string;
  email: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminUser {
  user_id: string;
  role: string;
  created_at: string;
}
