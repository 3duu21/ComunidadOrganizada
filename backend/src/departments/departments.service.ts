import {
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AccessControlService } from '../access-control/access-control.service';

@Injectable()
export class DepartmentsService {
  constructor(
    @Inject('SUPABASE') private supabase: SupabaseClient,
    private readonly accessControl: AccessControlService,
  ) {}

  // Helper: obtiene el edificio y valida que el user tenga acceso a su condominio
  private async ensureUserCanAccessBuilding(
    buildingId: string,
    userId: number,
  ) {
    const { data: building, error } = await this.supabase
      .from('buildings')
      .select('*')
      .eq('id', buildingId)
      .single();

    if (error) throw error;
    if (!building) throw new NotFoundException('Building not found');

    await this.accessControl.ensureUserHasAccessToCondominium(
      userId,
      building.condominium_id,
    );

    return building;
  }

  // Crear departamento
  async create(data: CreateDepartmentDto, userId: number) {
    // Validar acceso al edificio (y por ende, al condominio)
    await this.ensureUserCanAccessBuilding(data.building_id, userId);

    const { data: result, error } = await this.supabase
      .from('departments')
      .insert({
        building_id: data.building_id,
        floor: data.floor,
        number: data.number,
        monthly_fee: data.monthly_fee,
        owner_name: data.owner_name,
        owner_email: data.owner_email,
      })
      .select('*')
      .single();

    if (error) throw error;
    return result;
  }

  // Listar departamentos por edificio
  async findByBuilding(buildingId: string, userId: number) {
    await this.ensureUserCanAccessBuilding(buildingId, userId);

    const { data, error } = await this.supabase
      .from('departments')
      .select('*')
      .eq('building_id', buildingId);

    if (error) throw error;
    return data;
  }

  // Obtener uno por ID
  async findOne(id: string, userId: number) {
    const { data: department, error } = await this.supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!department) throw new NotFoundException('Department not found');

    // Validar acceso usando el building_id del depto
    await this.ensureUserCanAccessBuilding(department.building_id, userId);

    return department;
  }

  // Editar departamento
  async update(id: string, data: UpdateDepartmentDto, userId: number) {
    // Obtener el depto actual para saber a qué edificio/condominio pertenece
    const { data: existing, error: errorExisting } = await this.supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (errorExisting) throw errorExisting;
    if (!existing) throw new NotFoundException('Department not found');

    await this.ensureUserCanAccessBuilding(existing.building_id, userId);

    const { data: result, error } = await this.supabase
      .from('departments')
      .update({
        floor: data.floor ?? existing.floor,
        number: data.number ?? existing.number,
        monthly_fee: data.monthly_fee ?? existing.monthly_fee,
        owner_name: data.owner_name ?? existing.owner_name,
        owner_email: data.owner_email ?? existing.owner_email,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return result;
  }

  // Eliminar departamento
  async remove(id: string, userId: number) {
    // Validar primero que el depto exista y a qué edificio pertenece
    const { data: existing, error: errorExisting } = await this.supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (errorExisting) throw errorExisting;
    if (!existing) throw new NotFoundException('Department not found');

    await this.ensureUserCanAccessBuilding(existing.building_id, userId);

    const { error } = await this.supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Department deleted successfully' };
  }
}
