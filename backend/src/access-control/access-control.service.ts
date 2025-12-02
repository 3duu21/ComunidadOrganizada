// src/access-control/access-control.service.ts
import { Injectable, ForbiddenException, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AccessControlService {
  constructor(@Inject('SUPABASE') private supabase: SupabaseClient) {}

  /**
   * Verifica que el usuario tenga acceso al condominio dado.
   * Lanza ForbiddenException si no tiene acceso.
   */
  async ensureUserHasAccessToCondominium(userId: number, condominiumId: string) {
    const { data, error } = await this.supabase
      .from('user_condominiums')
      .select('id')
      .eq('user_id', userId)
      .eq('condominium_id', condominiumId)
      .maybeSingle();

    if (error) {
      console.error('Error checking access to condominium', error);
      throw new ForbiddenException('No se pudo validar el acceso al condominio');
    }

    if (!data) {
      throw new ForbiddenException(
        'No tienes acceso a este condominio',
      );
    }
  }
}
