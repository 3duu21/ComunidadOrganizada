// src/me/me.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class MeService {
  constructor(@Inject('SUPABASE') private supabase: SupabaseClient) { }

  private computeTrialExpiresAtFallback(user: any): string | null {
    // Si por algún motivo plan_expires_at no viene (usuarios viejos),
    // calculamos: plan_started_at || created_at + 14 días.
    const base = user?.plan_started_at || user?.created_at;
    if (!base) return null;

    const baseDate = new Date(base);
    if (isNaN(baseDate.getTime())) return null;

    const exp = new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    return exp.toISOString();
  }

  async getMeWithRoles(userId: number) {
    // 1) Datos del usuario
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select(
        'id, name, email, phone, role, created_at, avatar_url, plan_id, is_active, plan_started_at, plan_expires_at',
      )
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!user) throw new Error('Usuario no encontrado');

    // 2) Plan del usuario
    const planId = user.plan_id || 'trial';

    const { data: plan, error: planError } = await this.supabase
      .from('plans')
      .select(
        'id, name, price_monthly, max_condominiums, max_buildings_per_condo, max_departments_per_condo, allow_owner_portal',
      )
      .eq('id', planId)
      .maybeSingle();

    if (planError) throw planError;

    // 3) Roles por condominio
    const { data: roles, error: rolesError } = await this.supabase
      .from('user_condominiums')
      .select('role, condominium:condominiums(id, name)')
      .eq('user_id', userId);

    if (rolesError) throw rolesError;

    // 4) Settings
    const { data: settings, error: settingsError } = await this.supabase
      .from('user_settings')
      .select('default_condominium_id, theme, notify_email, notify_morosidad')
      .eq('user_id', userId)
      .maybeSingle();

    if (settingsError) throw settingsError;

    // ✅ Expiración efectiva (fallback para usuarios sin plan_expires_at)
    let effectivePlanExpiresAt: string | null = user.plan_expires_at ?? null;

    // Si es trial y no viene expires, calculamos fallback
    if (!effectivePlanExpiresAt && planId === 'trial') {
      effectivePlanExpiresAt = this.computeTrialExpiresAtFallback(user);
    }

    return {
      // 👇 campos directos para frontend
      is_active: Boolean(user.is_active),
      plan_started_at: user.plan_started_at ?? null,
      plan_expires_at: effectivePlanExpiresAt,

      // 👇 lo que ya usabas
      user,
      plan: plan || null,
      roles: (roles || [])
        .map((r: any) => {
          const condo = r.condominium;
          return {
            role: r.role,
            condominium_id: condo?.id ?? null,
            condominium_name: condo?.name ?? null,
          };
        })
        // opcional: filtrar roles rotos
        .filter((r: any) => r.condominium_id),
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
      .select(
        'id, name, email, phone, role, created_at, avatar_url, plan_id, is_active, plan_started_at, plan_expires_at',
      )
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
      .maybeSingle();


    if (error) throw error;
    return updated;
  }
}
