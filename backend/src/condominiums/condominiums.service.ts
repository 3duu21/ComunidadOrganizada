import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
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

  // Crear un condominio (y asociarlo al usuario como admin)
  async create(
    data: { name: string },
    userId: number,
  ): Promise<Condominium> {
    const { data: result, error } = await this.supabase
      .from('condominiums')
      .insert(data)
      .select('*')
      .single();

    if (error) throw error;

    // asociar al usuario en la pivote
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
