// src/parkings/parkings.service.ts
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Parking {
  id: string;
  number: string;
  condominium_id?: string | null;
  building_id?: string | null;
  department_id?: string | null;
  is_rented: boolean;
  monthly_price?: number | null;
}

@Injectable()
export class ParkingsService {
  constructor(@Inject('SUPABASE') private readonly supabase: SupabaseClient) {}

  // ======================
  // Helpers de validación
  // ======================

  // 1) Máx 1 estacionamiento por departamento
  private async ensureDepartmentHasNoParking(
    departmentId: string,
    ignoreId?: string,
  ) {
    if (!departmentId) return;

    let query = this.supabase
      .from('parkings')
      .select('id')
      .eq('department_id', departmentId)
      .limit(1);

    if (ignoreId) {
      query = query.neq('id', ignoreId);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (data && data.length > 0) {
      throw new BadRequestException(
        'Este departamento ya tiene un estacionamiento asignado.',
      );
    }
  }

  // 2) Número único por condominio
  private async ensureParkingNumberIsUnique(
    number: string,
    condominiumId: string,
    ignoreId?: string,
  ) {
    if (!condominiumId) {
      throw new BadRequestException(
        'Es obligatorio indicar el condominio al crear/editar un estacionamiento.',
      );
    }

    let query = this.supabase
      .from('parkings')
      .select('id')
      .eq('condominium_id', condominiumId)
      .eq('number', number)
      .limit(1);

    if (ignoreId) {
      query = query.neq('id', ignoreId);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (data && data.length > 0) {
      throw new BadRequestException(
        `Ya existe un estacionamiento con el número ${number} en este condominio.`,
      );
    }
  }

  // ======================
  // Métodos públicos
  // ======================

  async findAll(): Promise<Parking[]> {
    const { data, error } = await this.supabase
      .from('parkings')
      .select('*')
      .order('number', { ascending: true });

    if (error) throw error;
    return data as Parking[];
  }

  async findByDepartment(departmentId: string): Promise<Parking[]> {
    const { data, error } = await this.supabase
      .from('parkings')
      .select('*')
      .eq('department_id', departmentId)
      .order('number', { ascending: true });

    if (error) throw error;
    return data as Parking[];
  }

  async create(payload: {
    number: string;
    condominium_id: string;                 // 👈 obligatorio para tu lógica
    building_id?: string | null;
    department_id?: string | null;
    monthly_price?: number | null;
  }) {
    const { number, condominium_id, department_id } = payload;

    if (!number || !number.trim()) {
      throw new BadRequestException(
        'El número de estacionamiento es obligatorio.',
      );
    }

    if (!condominium_id) {
      throw new BadRequestException(
        'El condominio es obligatorio para el estacionamiento.',
      );
    }

    // Validar reglas antes de insertar
    await this.ensureParkingNumberIsUnique(number.trim(), condominium_id);
    if (department_id) {
      await this.ensureDepartmentHasNoParking(department_id);
    }

    const body = {
      ...payload,
      number: number.trim(),
      is_rented: !!department_id,
    };

    const { data, error } = await this.supabase
      .from('parkings')
      .insert(body)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async update(
    id: string,
    payload: {
      number?: string;
      condominium_id?: string;
      building_id?: string | null;
      department_id?: string | null;
      monthly_price?: number | null;
      is_rented?: boolean;
    },
  ) {
    // Traemos el registro actual para completar datos faltantes
    const { data: current, error: currentError } = await this.supabase
      .from('parkings')
      .select('*')
      .eq('id', id)
      .single();

    if (currentError) throw currentError;
    if (!current) {
      throw new BadRequestException('Estacionamiento no encontrado.');
    }

    const newNumber = payload.number ?? current.number;
    const newCondoId = payload.condominium_id ?? current.condominium_id;
    const newDeptId =
      payload.department_id !== undefined
        ? payload.department_id
        : current.department_id;

    // Validar número único por condominio
    await this.ensureParkingNumberIsUnique(newNumber, newCondoId, id);

    // Validar que el depto no tenga otro estacionamiento
    if (newDeptId) {
      await this.ensureDepartmentHasNoParking(newDeptId, id);
    }

    const body: any = {
      ...payload,
    };

    // Normalizamos number e is_rented
    body.number = newNumber;
    if (payload.department_id !== undefined) {
      body.is_rented = !!newDeptId;
    }

    const { data, error } = await this.supabase
      .from('parkings')
      .update(body)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.from('parkings').delete().eq('id', id);

    if (error) throw error;
    return { message: 'Parking deleted successfully' };
  }
}
