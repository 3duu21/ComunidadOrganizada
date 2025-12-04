// src/owner/owner.controller.ts
import {
  Controller,
  Get,
  Req,
  UseGuards,
  Inject,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccessControlService } from '../access-control/access-control.service';
import { SupabaseClient } from '@supabase/supabase-js';

@UseGuards(JwtAuthGuard)
@Controller('owner')
export class OwnerController {
  constructor(
    private readonly accessControl: AccessControlService,
    @Inject('SUPABASE') private readonly supabase: SupabaseClient,
  ) { }

  // 🔹 Departamentos del usuario logeado
  @Get('departments')
  async getMyDepartments(@Req() req: any) {
    const userId = req.user.userId;

    const deps = await this.accessControl.getUserDepartments(userId);

    return deps.map((row: any) => ({
      id: row.department_id,
      number: row.departments?.number,
      building_id: row.departments?.building_id,
    }));
  }

  // 🔹 Pagos (ingresos) de todos sus departamentos
  @Get('payments')
  async getMyPayments(@Req() req: any) {
    const userId = req.user.userId;

    const deps = await this.accessControl.getUserDepartments(userId);
    const departmentIds = deps.map((d: any) => d.department_id);

    if (departmentIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from('payments')
      .select(
        `
        id,
        date,
        amount,
        type_income,
        payment_method,
        description,
        departments ( number )
      `,
      )
      .in('department_id', departmentIds)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map((p: any) => ({
      id: p.id,
      date: p.date,
      amount: p.amount,
      type_income: p.type_income,
      payment_method: p.payment_method,
      description: p.description,
      department_number: p.departments?.number || '—',
    }));
  }

  // 🔹 Helper rango de fechas para un mes
  private getMonthDateRange(year: number, month: number) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0); // último día del mes
    const pad = (n: number) => String(n).padStart(2, '0');
    const fromStr = `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(
      from.getDate(),
    )}`;
    const toStr = `${to.getFullYear()}-${pad(to.getMonth() + 1)}-${pad(
      to.getDate(),
    )}`;
    return { fromStr, toStr };
  }

  // 🔹 NUEVO: Boleta / comprobante de GC por mes y depto
  @Get('gastos-comunes/receipt')
  async getGcReceipt(
    @Req() req: any,
    @Query('department_id') departmentId: string,
    @Query('year') yearStr: string,
    @Query('month') monthStr: string,
  ) {
    const userId = req.user.userId;

    if (!departmentId || !yearStr || !monthStr) {
      throw new BadRequestException(
        'Faltan parámetros: department_id, year, month',
      );
    }

    const year = Number(yearStr);
    const month = Number(monthStr);

    if (!year || !month || month < 1 || month > 12) {
      throw new BadRequestException('Parámetros de año/mes inválidos');
    }

    // 1) Validar que el usuario sea dueño del depto
    await this.accessControl.ensureUserIsOwnerOfDepartment(userId, departmentId);

    // 2) Traer info del depto + edificio + condominio
    const { data: depRow, error: depErr } = await this.supabase
      .from('departments')
      .select(
        `
        id,
        number,
        building_id,
        buildings (
          id,
          name,
          condominiums ( id, name )
        )
      `,
      )
      .eq('id', departmentId)
      .maybeSingle();

    if (depErr) throw depErr;
    if (!depRow) {
      throw new NotFoundException('Departamento no encontrado');
    }

    const buildingId = depRow.building_id;

    // 👇 Normalizar building y condominio (porque vienen como arrays)
    const buildingRow: any = Array.isArray(depRow.buildings)
      ? depRow.buildings[0]
      : depRow.buildings;

    const condoRow: any =
      buildingRow?.condominiums && Array.isArray(buildingRow.condominiums)
        ? buildingRow.condominiums[0]
        : buildingRow?.condominiums || null;


    // 3) Buscar el periodo de cobro de ese edificio en ese año/mes
    const { data: period, error: periodErr } = await this.supabase
      .from('billing_periods')
      .select('*')
      .eq('building_id', buildingId)
      .eq('year', year)
      .eq('month', month)
      .maybeSingle();

    if (periodErr) throw periodErr;
    if (!period) {
      throw new NotFoundException(
        'No existe periodo de gastos comunes para ese mes',
      );
    }

    // 4) Buscar la deuda asignada a ese depto
    const { data: chargeRow, error: chargeErr } = await this.supabase
      .from('billing_department_status')
      .select('charge_amount')
      .eq('billing_period_id', period.id)
      .eq('department_id', departmentId)
      .maybeSingle();

    if (chargeErr) throw chargeErr;

    const chargeAmount = chargeRow?.charge_amount || 0;

    // 5) Pagos del mes para ese depto (solo gasto común)
    const { fromStr, toStr } = this.getMonthDateRange(year, month);

    const { data: payments, error: payErr } = await this.supabase
      .from('payments')
      .select('id, date, amount, payment_method, description')
      .eq('building_id', buildingId)
      .eq('department_id', departmentId)
      .eq('type_income', 'Gasto común')
      .gte('date', fromStr)
      .lte('date', toStr)
      .order('date', { ascending: true });

    if (payErr) throw payErr;

    const totalPaid = (payments || []).reduce(
      (s, p) => s + (p.amount || 0),
      0,
    );

    let status: 'pagado' | 'parcial' | 'pendiente' = 'pendiente';
    if (chargeAmount > 0 && totalPaid >= chargeAmount) {
      status = 'pagado';
    } else if (totalPaid > 0 && totalPaid < chargeAmount) {
      status = 'parcial';
    }

    return {
      period: {
        id: period.id,
        year: period.year,
        month: period.month,
        status: period.status,
        common_fee_amount: period.common_fee_amount,
      },
      department: {
        id: depRow.id,
        number: depRow.number,
      },
      building: {
        id: buildingRow?.id,
        name: buildingRow?.name,
      },
      condominium: {
        id: condoRow?.id || null,
        name: condoRow?.name || null,
      },
      charge_amount: chargeAmount,
      payments: payments || [],
      totals: {
        charged: chargeAmount,
        paid: totalPaid,
        balance: chargeAmount - totalPaid,
        status,
      },
    };

  }
}
