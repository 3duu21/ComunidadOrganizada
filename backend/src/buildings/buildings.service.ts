import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessControlService } from '../access-control/access-control.service';

@Injectable()
export class BuildingsService {
  constructor(
    @Inject('SUPABASE') private readonly supabase: SupabaseClient,
    private readonly accessControl: AccessControlService, // 👈 ahora sí lo inyectamos
  ) {}

  // Crear edificio
  async createBuilding(
    data: { name: string; address?: string; condominium_id: string },
    userId: number,
  ) {
    // 1) Validar que el usuario tenga acceso al condominio donde está creando el edificio
    await this.accessControl.ensureUserHasAccessToCondominium(
      userId,
      data.condominium_id,
    );

    // 2) Obtener usuario con su plan
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
      .select('id, max_buildings_per_condo')
      .eq('id', planId)
      .maybeSingle();

    if (planError) throw planError;

    // 3) Validar límite de edificios por condominio según el plan
    if (plan?.max_buildings_per_condo != null) {
      const { count, error: countError } = await this.supabase
        .from('buildings')
        .select('*', { count: 'exact', head: true })
        .eq('condominium_id', data.condominium_id);

      if (countError) throw countError;

      const currentCount = count ?? 0;

      if (currentCount >= plan.max_buildings_per_condo) {
        throw new BadRequestException(
          'Has alcanzado el número máximo de edificios permitidos para este condominio según tu plan. Actualiza tu plan para agregar más edificios.',
        );
      }
    }

    // 4) Crear edificio
    const { data: result, error } = await this.supabase
      .from('buildings')
      .insert(data)
      .select('*')
      .single();

    if (error) throw error;
    return result;
  }

  // Listar edificios, filtrando SIEMPRE por condominio y validando acceso
  async getAllBuildings(condominiumId: string, userId: number) {
    if (!condominiumId) {
      throw new ForbiddenException(
        'Se requiere condominium_id para listar edificios',
      );
    }

    // 1) Validar acceso al condominio
    await this.accessControl.ensureUserHasAccessToCondominium(
      userId,
      condominiumId,
    );

    // 2) Traer solo edificios de ese condominio
    const { data, error } = await this.supabase
      .from('buildings')
      .select('*')
      .eq('condominium_id', condominiumId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getBuilding(id: string, userId: number) {
    const { data, error } = await this.supabase
      .from('buildings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Building not found');

    // Validar acceso al condominio de ese edificio
    await this.accessControl.ensureUserHasAccessToCondominium(
      userId,
      data.condominium_id,
    );

    return data;
  }

  async updateBuilding(id: string, updates: any, userId: number) {
    // Primero obtenemos el edificio para ver a qué condominio pertenece
    const { data: existing, error: errorExisting } = await this.supabase
      .from('buildings')
      .select('*')
      .eq('id', id)
      .single();

    if (errorExisting) throw errorExisting;
    if (!existing) throw new NotFoundException('Building not found');

    // Validar acceso al condominio asociado
    await this.accessControl.ensureUserHasAccessToCondominium(
      userId,
      existing.condominium_id,
    );

    const { data, error } = await this.supabase
      .from('buildings')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Building not found');

    return data;
  }

  async deleteBuilding(id: string, userId: number) {
    // Validar que el edificio existe y pertenece a un condominio del usuario
    const { data: existing, error: errorExisting } = await this.supabase
      .from('buildings')
      .select('*')
      .eq('id', id)
      .single();

    if (errorExisting) throw errorExisting;
    if (!existing) throw new NotFoundException('Building not found');

    await this.accessControl.ensureUserHasAccessToCondominium(
      userId,
      existing.condominium_id,
    );

    const { error } = await this.supabase
      .from('buildings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { message: 'Building deleted successfully' };
  }
}
