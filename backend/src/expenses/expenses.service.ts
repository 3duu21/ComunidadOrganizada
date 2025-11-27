import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ExpensesService {
  constructor(@Inject('SUPABASE') private readonly supabase: SupabaseClient) {}

  // Crear gasto
  async create(body: any) {
    const { data, error } = await this.supabase
      .from('expenses')
      .insert(body)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Listar con filtros
  async findFiltered(filters: {
    building_id?: string;
    type_expense?: string;
  }) {
    let query = this.supabase.from('expenses').select('*');

    // 👉 FILTRO REAL = building_id
    if (filters.building_id) {
      query = query.eq('building_id', filters.building_id);
    }

    // 👉 FILTRO REAL = type_expense
    if (filters.type_expense) {
      query = query.eq('type_expense', filters.type_expense);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Obtener uno
  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Editar
  async update(id: string, body: any) {
    const { data, error } = await this.supabase
      .from('expenses')
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
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Gasto eliminado correctamente' };
  }

  // Tipos de gasto
  async getTypes() {
    return [
      'Remuneraciones y Gastos de Administracion',
      'Gastos Generales y Gastos de uso y consumo',
      'Gastos de Mantencion y Reparacion'
    ];
  }
}
