import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Condominium {
  id: string;
  name: string;
  created_at?: string;
}

@Injectable()
export class CondominiumsService {
  constructor(@Inject('SUPABASE') private supabase: SupabaseClient) {}

  // 🔵 Lista SOLO los condominios del usuario
  async findForUser(userId: number): Promise<Condominium[]> {
    // 1) buscar en la pivote user_condominiums
    const { data: links, error } = await this.supabase
      .from('user_condominiums')
      .select('condominium_id')
      .eq('user_id', userId);

    if (error) throw error;

    if (!links || links.length === 0) {
      return [];
    }

    const ids = links.map((l) => l.condominium_id);

    // 2) traer solo esos condominios
    const { data: condos, error: error2 } = await this.supabase
      .from('condominiums')
      .select('*')
      .in('id', ids)
      .order('name', { ascending: true });

    if (error2) throw error2;

    return condos as Condominium[];
  }

  // Obtener uno por ID, validando acceso
  async findOne(id: string, userId: number): Promise<Condominium> {
    // validar que el condominio esté asociado a este usuario
    const { data: link, error: linkError } = await this.supabase
      .from('user_condominiums')
      .select('id')
      .eq('user_id', userId)
      .eq('condominium_id', id)
      .maybeSingle();

    if (linkError) throw linkError;
    if (!link) {
      throw new ForbiddenException('No tienes acceso a este condominio');
    }

    const { data, error } = await this.supabase
      .from('condominiums')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Condominio no encontrado');

    return data as Condominium;
  }

  // Crear un condominio (validando plan) y asociarlo al usuario como admin
  async create(
    data: { name: string },
    userId: number,
  ): Promise<Condominium> {
    // 0) Obtener usuario con su plan
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('id, plan_id')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!user) {
      throw new ForbiddenException('Usuario no encontrado');
    }

    const planId = user.plan_id || 'trial';

    const { data: plan, error: planError } = await this.supabase
      .from('plans')
      .select('id, max_condominiums')
      .eq('id', planId)
      .maybeSingle();

    if (planError) throw planError;

    // 1) Validar límite de condominios del plan
    if (plan?.max_condominiums != null) {
      const { count, error: countError } = await this.supabase
        .from('user_condominiums')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) throw countError;

      const currentCount = count ?? 0;

      if (currentCount >= plan.max_condominiums) {
        throw new BadRequestException(
          'Has alcanzado el número máximo de condominios permitidos por tu plan. Actualiza tu plan para agregar más.',
        );
      }
    }

    // 2) Crear condominio
    const { data: result, error } = await this.supabase
      .from('condominiums')
      .insert(data)
      .select('*')
      .single();

    if (error) throw error;

    // 3) Asociar al usuario en la pivote
    const { error: linkError } = await this.supabase
      .from('user_condominiums')
      .insert({
        user_id: userId,
        condominium_id: result.id,
        role: 'admin',
      });

    if (linkError) throw linkError;

    return result as Condominium;
  }

  // Editar condominio (validando acceso)
  async update(
    id: string,
    data: { name: string },
    userId: number,
  ): Promise<Condominium> {
    // validar acceso
    const { data: link, error: linkError } = await this.supabase
      .from('user_condominiums')
      .select('id')
      .eq('user_id', userId)
      .eq('condominium_id', id)
      .maybeSingle();

    if (linkError) throw linkError;
    if (!link) {
      throw new ForbiddenException('No tienes acceso a este condominio');
    }

    const { data: result, error } = await this.supabase
      .from('condominiums')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    if (!result) throw new NotFoundException('Condominio no encontrado');

    return result as Condominium;
  }

  // Eliminar condominio (validando acceso)
  async remove(id: string, userId: number) {
    // validar acceso
    const { data: link, error: linkError } = await this.supabase
      .from('user_condominiums')
      .select('id')
      .eq('user_id', userId)
      .eq('condominium_id', id)
      .maybeSingle();

    if (linkError) throw linkError;
    if (!link) {
      throw new ForbiddenException('No tienes acceso a este condominio');
    }

    const { error } = await this.supabase
      .from('condominiums')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Condominio eliminado correctamente' };
  }
}
