import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessControlService } from '../access-control/access-control.service';
import { CreatePaymentDto } from './dto/create-payments.dto';
import { UpdatePaymentDto } from './dto/update-payments.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('SUPABASE') private readonly supabase: SupabaseClient,
    private readonly accessControl: AccessControlService,
  ) { }

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
  async create(body: CreatePaymentDto, userId: number) {
    if (!body.building_id) {
      throw new ForbiddenException(
        'Se requiere building_id para crear un pago',
      );
    }

    // Validar que el usuario pueda operar sobre ese edificio/condominio
    await this.ensureUserCanAccessBuilding(body.building_id, userId);

    // Mapeo explícito a columnas reales de la BD
    const payload: any = {
      building_id: body.building_id,
      department_id: body.department_id, // 👈 en BD es department_id
      amount: body.amount,
      description: body.description,
      date: body.date,
      payment_method: body.payment_method,
      document_number: body.document_number,
      type_income: body.type_income ?? null, 
    };

    const { data, error } = await this.supabase
      .from('payments')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Buscar ingresos de un edificio (wrapper)
  async findByBuilding(buildingId: string, userId: number) {
    return this.findAll(buildingId, userId);
  }

  // Obtener uno
  async findOne(id: string, userId: number) {
    const { data: payment, error } = await this.supabase
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
        type_income
      `,
      )
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
  async update(id: string, body: UpdatePaymentDto, userId: number) {
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

    // Construimos payload controlado (no mandamos cualquier cosa)
    const payload: any = {};

    if (body.amount !== undefined) payload.amount = body.amount;
    if (body.description !== undefined) payload.description = body.description;
    if (body.date !== undefined) payload.date = body.date;
    if (body.payment_method !== undefined)
      payload.payment_method = body.payment_method;
    if (body.document_number !== undefined)
      payload.document_number = body.document_number;
    if ((body as any).type_income !== undefined)
      payload.type_income = body.type_income; 

    // Si quieres permitir cambiar el depto:
    if ((body as any).apartment_id !== undefined) {
      payload.department_id = (body as any).apartment_id;
    }

    const { data, error } = await this.supabase
      .from('payments')
      .update(payload)
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
        type_income,
        departments (number)
      `,
      )
      .eq('building_id', buildingId);

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data;
  }

  // ...
  async findByFilter(
    buildingId: string | undefined,
    condoId: string | undefined,
    typeIncome: string | undefined,
    departmentId: string | undefined,   // 👈 NUEVO
    userId: number,
  ) {
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
      type_income,
      departments (number),
      buildings (condominium_id)
    `,
      );

    if (buildingId) query = query.eq('building_id', buildingId);
    if (condoId) query = query.eq('buildings.condominium_id', condoId);
    if (typeIncome) query = query.eq('type_income', typeIncome);
    if (departmentId) query = query.eq('department_id', departmentId); // 👈 filtro por depto

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return data;
  }


  // Tipos de ingreso
  async getTypes() {
    return [
      'Arriendo',
      'Gasto común',
      'Estacionamiento',
      'Multa',
      'Interés por mora',
      'Otros ingresos',
    ];
  }
}
