// src/me/me.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class MeService {
  constructor(@Inject('SUPABASE') private supabase: SupabaseClient) {}

  async getMeWithRoles(userId: number) {
    // 1) Datos del usuario
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('id, name, email, phone, role, created_at, avatar_url')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // 2) Roles por condominio
    const { data: roles, error: rolesError } = await this.supabase
      .from('user_condominiums')
      .select('role, condominium:condominiums(id, name)')
      .eq('user_id', userId);

    if (rolesError) throw rolesError;

    // 3) Settings
    const { data: settings, error: settingsError } = await this.supabase
      .from('user_settings')
      .select('default_condominium_id, theme, notify_email, notify_morosidad')
      .eq('user_id', userId)
      .maybeSingle();

    if (settingsError) throw settingsError;

    return {
      user,
      roles: (roles || []).map((r: any) => ({
        role: r.role,
        condominium_id: r.condominium.id,
        condominium_name: r.condominium.name,
      })),
      settings: settings || {},
    };
  }

  async updateProfile(
    userId: number,
    data: { name?: string; phone?: string; avatar_url?: string },
  ) {
    const { data: updated, error } = await this.supabase
      .from('users')
      .update(data)
      .eq('id', userId)
      .select('id, name, email, phone, role, avatar_url')
      .single();

    if (error) throw error;
    return updated;
  }

  async updateSettings(
    userId: number,
    data: {
      default_condominium_id?: string | null;
      theme?: string;
      notify_email?: boolean;
      notify_morosidad?: boolean;
    },
  ) {
    const { data: updated, error } = await this.supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...data })
      .select('default_condominium_id, theme, notify_email, notify_morosidad')
      .single();

    if (error) throw error;
    return updated;
  }
}
