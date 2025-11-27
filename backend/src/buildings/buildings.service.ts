import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class BuildingsService {
  constructor(@Inject('SUPABASE') private readonly supabase: SupabaseClient) {}

  // Crear edificio
  async createBuilding(data: { name: string; address?: string; condominium_id: string }) {
    const { data: result, error } = await this.supabase
      .from('buildings')
      .insert(data)
      .select('*')
      .single();
    if (error) throw error;
    return result;
  }

  // Listar edificios, opcionalmente filtrando por condominio
  async getAllBuildings(condominiumId?: string) {
    let query = this.supabase.from('buildings').select('*');
    if (condominiumId) query = query.eq('condominium_id', condominiumId);
    const { data, error } = await query.order('name', { ascending: true });
    if (error) throw error;
    return data;
  }

  async getBuilding(id: string) {
    const { data, error } = await this.supabase
      .from('buildings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Building not found');

    return data;
  }

  async updateBuilding(id: string, updates: any) {
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

  async deleteBuilding(id: string) {
    const { error } = await this.supabase
      .from('buildings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { message: 'Building deleted successfully' };
  }

  async getBuildingsByCondominium(condominiumId: string) {
  const { data, error } = await this.supabase
    .from('buildings')
    .select('*')
    .eq('condominium_id', condominiumId)
    .order('name', { ascending: true }); // opcional: orden alfabético

  if (error) throw error;
  return data;
}

}
