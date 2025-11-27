import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class PaymentsService {
  constructor(@Inject('SUPABASE') private readonly supabase: SupabaseClient) { }

  // Crear ingreso
  async create(body: any) {
    const { data, error } = await this.supabase
      .from('payments')
      .insert(body)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Buscar ingresos de un edificio (llama a findAll)
  async findByBuilding(buildingId: string) {
    return this.findAll(buildingId);
  }

  // Obtener uno
  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Editar
  async update(id: string, body: any) {
    const { data, error } = await this.supabase
      .from('payments')
      .update(body)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Eliminar
  async remove(id: string) {
    const { error } = await this.supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Pago eliminado correctamente' };
  }

  // Listar pagos, opcionalmente por edificio, incluyendo número de departamento
  async findAll(buildingId?: string) {
    let query = this.supabase
      .from('payments')
      .select(`
      id,
      department_id,
      amount,
      description,
      date,
      created_at,
      building_id,
      departments (number)
    `);

    if (buildingId) {
      query = query.eq('building_id', buildingId);
    }
    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findByFilter(buildingId?: string, condoId?: string) {
    let query = this.supabase
      .from('payments')
      .select(`
      id,
      department_id,
      amount,
      description,
      date,
      created_at,
      building_id,
      departments (number),
      buildings (condominium_id)
    `);

    if (buildingId) query = query.eq('building_id', buildingId);
    if (condoId) query = query.eq('buildings.condominium_id', condoId);

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data;
  }


}
