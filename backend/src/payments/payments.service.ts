import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessControlService } from '../access-control/access-control.service';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('SUPABASE') private readonly supabase: SupabaseClient,
    private readonly accessControl: AccessControlService,
  ) {}

  // Helper: valida acceso del usuario al edificio y su condominio
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

  // Crear ingreso
  async create(body: any, userId: number) {
    if (!body.building_id) {
      throw new ForbiddenException(
        'Se requiere building_id para crear un pago',
      );
    }

    // Validar que el usuario pueda operar sobre ese edificio/condominio
    await this.ensureUserCanAccessBuilding(body.building_id, userId);

    const { data, error } = await this.supabase
      .from('payments')
      .insert(body)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Buscar ingresos de un edificio (llama a findAll con control de acceso)
  async findByBuilding(buildingId: string, userId: number) {
    return this.findAll(buildingId, userId);
  }

  // Obtener uno
  async findOne(id: string, userId: number) {
    const { data: payment, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!payment) throw new NotFoundException('Payment not found');

    // Validar acceso por building_id
    if (payment.building_id) {
      await this.ensureUserCanAccessBuilding(payment.building_id, userId);
    }

    return payment;
  }

  // Editar
  async update(id: string, body: any, userId: number) {
    // Primero obtener el pago actual
    const { data: existing, error: errorExisting } = await this.supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (errorExisting) throw errorExisting;
    if (!existing) throw new NotFoundException('Payment not found');

    if (existing.building_id) {
      await this.ensureUserCanAccessBuilding(existing.building_id, userId);
    }

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
  async remove(id: string, userId: number) {
    const { data: existing, error: errorExisting } = await this.supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (errorExisting) throw errorExisting;
    if (!existing) throw new NotFoundException('Payment not found');

    if (existing.building_id) {
      await this.ensureUserCanAccessBuilding(existing.building_id, userId);
    }

    const { error } = await this.supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Pago eliminado correctamente' };
  }

  // Listar pagos, opcionalmente por edificio, incluyendo número de departamento
  async findAll(buildingId: string | undefined, userId: number) {
    if (!buildingId) {
      throw new ForbiddenException(
        'Se requiere building_id para listar pagos',
      );
    }

    await this.ensureUserCanAccessBuilding(buildingId, userId);

    let query = this.supabase
      .from('payments')
      .select(
        `
        id,
        department_id,
        amount,
        description,
        date,
        created_at,
        building_id,
        payment_method,
        document_number,
        departments (number)
      `,
      )
      .eq('building_id', buildingId);

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Listar pagos con filtro por edificio y/o condominio
  async findByFilter(
    buildingId: string | undefined,
    condoId: string | undefined,
    userId: number,
  ) {
    // Seguridad: requerimos al menos uno de los filtros
    if (!buildingId && !condoId) {
      throw new ForbiddenException(
        'Se requiere building_id o condominium_id para listar pagos',
      );
    }

    if (buildingId) {
      await this.ensureUserCanAccessBuilding(buildingId, userId);
    }

    if (condoId) {
      await this.accessControl.ensureUserHasAccessToCondominium(
        userId,
        condoId,
      );
    }

    let query = this.supabase
      .from('payments')
      .select(
        `
        id,
        department_id,
        amount,
        description,
        date,
        created_at,
        building_id,
        payment_method,
        document_number,
        departments (number),
        buildings (condominium_id)
      `,
      );

    if (buildingId) query = query.eq('building_id', buildingId);
    if (condoId) query = query.eq('buildings.condominium_id', condoId);

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data;
  }
}
