import { supabase } from '../lib/supabase';
import type { Battle, Look, BattleResult, LookOfTheWeek, UserNotification } from '../types';

// ==============================================================================
// SERVIÇOS DE BATALHAS (CRUD)
// ==============================================================================

export const battlesService = {
  async getAll(): Promise<Battle[]> {
    const { data, error } = await supabase
      .from('battles')
      .select('*, results:battle_results(*)')
      .order('edition_number', { ascending: false });

    if (error) throw error;
    return (data || []) as Battle[];
  },

  async getById(id: string): Promise<Battle | null> {
    const { data, error } = await supabase
      .from('battles')
      .select('*, results:battle_results(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Battle;
  },

  async create(battle: Omit<Battle, 'id' | 'created_at' | 'updated_at'>): Promise<Battle> {
    const { data, error } = await supabase
      .from('battles')
      .insert([battle])
      .select()
      .single();

    if (error) throw error;
    return data as Battle;
  },

  async update(id: string, updates: Partial<Battle>): Promise<Battle> {
    const { data, error } = await supabase
      .from('battles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Battle;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('battles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ==============================================================================
// SERVIÇOS DE LOOKS (CRUD)
// ==============================================================================

export const looksService = {
  async getAll(filters?: { battle_id?: string; tag?: string }): Promise<Look[]> {
    let query = supabase
      .from('looks')
      .select('*, battle:battles(edition_number, title)')
      .order('created_at', { ascending: false });

    if (filters?.battle_id) {
      query = query.eq('battle_id', filters.battle_id);
    }
    if (filters?.tag) {
      query = query.contains('style_tags', [filters.tag]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Look[];
  },

  async create(look: Omit<Look, 'id' | 'created_at' | 'updated_at' | 'votes_count'>): Promise<Look> {
    const { data, error } = await supabase
      .from('looks')
      .insert([{ ...look, votes_count: 0 }])
      .select()
      .single();

    if (error) throw error;
    return data as Look;
  },

  async update(id: string, updates: Partial<Look>): Promise<Look> {
    const { data, error } = await supabase
      .from('looks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Look;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('looks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ==============================================================================
// SERVIÇOS DO QUADRO DE CAMPEÕES E RESULTADOS (CRUD)
// ==============================================================================

export const resultsService = {
  async getAllWithBattles(): Promise<{ battle: Battle; results: BattleResult[] }[]> {
    // Busca todas as batalhas que possuem resultados ou concluídas
    const { data: battles, error: battlesError } = await supabase
      .from('battles')
      .select('*, results:battle_results(*)')
      .order('edition_number', { ascending: false });

    if (battlesError) throw battlesError;

    // Filtra e organiza pódio
    const formatted = (battles || [])
      .filter((b) => b.results && b.results.length > 0)
      .map((b) => {
        const sortedResults = [...(b.results as BattleResult[])].sort((a, b) => a.placement - b.placement);
        return {
          battle: b as Battle,
          results: sortedResults,
        };
      });

    return formatted;
  },

  async savePlacement(result: {
    battle_id: string;
    placement: 1 | 2 | 3;
    participant_name: string;
    look_id?: string | null;
    look_title?: string | null;
    look_image_url: string;
    custom_notes?: string | null;
  }): Promise<BattleResult> {
    // Insere ou atualiza via upsert na chave única (battle_id, placement)
    const { data, error } = await supabase
      .from('battle_results')
      .upsert(
        [
          {
            battle_id: result.battle_id,
            placement: result.placement,
            participant_name: result.participant_name,
            look_id: result.look_id || null,
            look_title: result.look_title || null,
            look_image_url: result.look_image_url,
            custom_notes: result.custom_notes || null,
          },
        ],
        { onConflict: 'battle_id, placement' }
      )
      .select()
      .single();

    if (error) throw error;
    return data as BattleResult;
  },

  async deletePlacement(resultId: string): Promise<void> {
    const { error } = await supabase
      .from('battle_results')
      .delete()
      .eq('id', resultId);

    if (error) throw error;
  },
};

// ==============================================================================
// SERVIÇOS DE LOOK DA SEMANA (CRUD)
// ==============================================================================

export const lookOfTheWeekService = {
  async getActive(): Promise<LookOfTheWeek | null> {
    const { data, error } = await supabase
      .from('look_of_the_week')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as LookOfTheWeek | null;
  },

  async getAll(): Promise<LookOfTheWeek[]> {
    const { data, error } = await supabase
      .from('look_of_the_week')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as LookOfTheWeek[];
  },

  async createOrUpdate(item: Omit<LookOfTheWeek, 'id' | 'created_at' | 'updated_at'>): Promise<LookOfTheWeek> {
    // Se marcando como ativo, desativa os outros primeiro
    if (item.is_active) {
      await supabase
        .from('look_of_the_week')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { data, error } = await supabase
      .from('look_of_the_week')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data as LookOfTheWeek;
  },

  async update(id: string, updates: Partial<LookOfTheWeek>): Promise<LookOfTheWeek> {
    if (updates.is_active) {
      await supabase
        .from('look_of_the_week')
        .update({ is_active: false })
        .neq('id', id);
    }

    const { data, error } = await supabase
      .from('look_of_the_week')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as LookOfTheWeek;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('look_of_the_week')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ==============================================================================
// SERVIÇOS DE NOTIFICAÇÕES DE NOVOS USUÁRIOS (ADMIN ONLY COM REALTIME)
// ==============================================================================

export const notificationsService = {
  async getAll(): Promise<UserNotification[]> {
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as UserNotification[];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  },

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  subscribeToNewUsers(onInsert: (notification: UserNotification) => void) {
    const channel = supabase
      .channel('admin-user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
        },
        (payload) => {
          onInsert(payload.new as UserNotification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
