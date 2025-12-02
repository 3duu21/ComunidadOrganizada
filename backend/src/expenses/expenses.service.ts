import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessControlService } from '../access-control/access-control.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
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

  // Crear gasto
  async create(body: CreateExpenseDto, userId: number) {
    if (!body.building_id) {
      throw new ForbiddenException(
        'Se requiere building_id para crear un gasto',
      );
    }

    await this.ensureUserCanAccessBuilding(body.building_id, userId);

    const { data, error } = await this.supabase
      .from('expenses')
      .insert({
        building_id: body.building_id,
        date: body.date,
        amount: body.amount,
        type_expense: body.type_expense,
        description: body.description,
        // 👇 nuevos campos
        payment_method: body.payment_method,
        document_number: body.document_number,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Listar con filtros
  async findFiltered(
    filters: {
      building_id?: string;
      type_expense?: string;
    },
    userId: number,
  ) {
    if (!filters.building_id) {
      throw new ForbiddenException(
        'Se requiere building_id para listar gastos',
      );
    }

    await this.ensureUserCanAccessBuilding(filters.building_id, userId);

    let query = this.supabase.from('expenses').select('*');

    if (filters.building_id) {
      query = query.eq('building_id', filters.building_id);
    }

    if (filters.type_expense) {
      query = query.eq('type_expense', filters.type_expense);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Obtener uno
  async findOne(id: string, userId: number) {
    const { data: expense, error } = await this.supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!expense) throw new NotFoundException('Expense not found');

    if (expense.building_id) {
      await this.ensureUserCanAccessBuilding(expense.building_id, userId);
    }

    return expense;
  }

  // Editar
  async update(id: string, body: UpdateExpenseDto, userId: number) {
    const { data: existing, error: errorExisting } = await this.supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (errorExisting) throw errorExisting;
    if (!existing) throw new NotFoundException('Expense not found');

    if (existing.building_id) {
      await this.ensureUserCanAccessBuilding(existing.building_id, userId);
    }

    const { data, error } = await this.supabase
      .from('expenses')
      .update({
        date: body.date ?? existing.date,
        amount: body.amount ?? existing.amount,
        type_expense: body.type_expense ?? existing.type_expense,
        description: body.description ?? existing.description,
        // 👇 nuevos campos
        payment_method: body.payment_method ?? existing.payment_method,
        document_number: body.document_number ?? existing.document_number,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Eliminar
  async remove(id: string, userId: number) {
    const { data: existing, error: errorExisting } = await this.supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (errorExisting) throw errorExisting;
    if (!existing) throw new NotFoundException('Expense not found');

    if (existing.building_id) {
      await this.ensureUserCanAccessBuilding(existing.building_id, userId);
    }

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
      'Gastos de Mantencion y Reparacion',
    ];
  }
}
