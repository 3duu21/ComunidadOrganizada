import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Condominium {
  id: string;
  name: string;
  // si en tu tabla hay más columnas, las puedes agregar aquí
}

export interface CondominiumWithRole extends Condominium {
  role: string;
}

type UserCondoRelation = {
  condominium_id: string;
  role: string | null;
};

@Injectable()
export class CondominiumsService {
  constructor(@Inject('SUPABASE') private supabase: SupabaseClient) {}

  // 🔐 Listar los condominios de un usuario (usando tabla pivote user_condominiums)
  async findForUser(userId: number): Promise<CondominiumWithRole[]> {
    // 1) Traer relaciones user-condominio
    const { data: relations, error: relError } = await this.supabase
      .from('user_condominiums')
      .select('condominium_id, role')
      .eq('user_id', userId);

    if (relError) throw relError;

    const rels = (relations || []) as UserCondoRelation[];

    if (rels.length === 0) {
      return [];
    }

    const ids = rels.map((r) => r.condominium_id);

    // 2) Traer los condominios correspondientes
    const { data: condos, error: condosError } = await this.supabase
      .from('condominiums')
      .select('*')
      .in('id', ids);

    if (condosError) throw condosError;

    const condosTyped = (condos || []) as Condominium[];

    // 3) Mezclar datos del condominio con el rol del usuario en cada uno
    return condosTyped.map((c) => {
      const relation = rels.find((r) => r.condominium_id === c.id);
      return {
        ...c,
        role: relation?.role || 'viewer',
      };
    });
  }

  // Listar todos los condominios
  async findAll(): Promise<Condominium[]> {
    const { data, error } = await this.supabase
      .from('condominiums')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Condominium[];
  }

  // Obtener uno por ID
  async findOne(id: string): Promise<Condominium> {
    const { data, error } = await this.supabase
      .from('condominiums')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Condominium;
  }

  // Crear un condominio
  async create(data: { name: string }) {
    const { data: result, error } = await this.supabase
      .from('condominiums')
      .insert(data)
      .select('*')
      .single();

    if (error) throw error;
    return result;
  }

  // Editar condominio
  async update(id: string, data: { name: string }) {
    const { data: result, error } = await this.supabase
      .from('condominiums')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return result;
  }

  // Eliminar condominio
  async remove(id: string) {
    const { error } = await this.supabase
      .from('condominiums')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Condominium deleted successfully' };
  }
}
