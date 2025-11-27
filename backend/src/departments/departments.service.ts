import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(@Inject('SUPABASE') private supabase: SupabaseClient) {}

  // Crear departamento
  async create(data: CreateDepartmentDto) {
    const { data: result, error } = await this.supabase
      .from('departments')
      .insert(data)
      .select('*')
      .single();

    if (error) throw error;
    return result;
  }

  // Listar departamentos por edificio
  async findByBuilding(buildingId: string) {
    const { data, error } = await this.supabase
      .from('departments')
      .select('*')
      .eq('building_id', buildingId);

    if (error) throw error;
    return data;
  }

  // Obtener uno por ID
  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Editar departamento
  async update(id: string, data: UpdateDepartmentDto) {
    const { data: result, error } = await this.supabase
      .from('departments')
      .update(data)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return result;
  }

  // Eliminar departamento
  async remove(id: string) {
    const { error } = await this.supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Department deleted successfully' };
  }
}
