// src/billing-periods/billing-periods.service.ts
import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessControlService } from '../access-control/access-control.service';
import { OpenPeriodDto } from './dto/open-period.dto';


export type PeriodStatus = 'open' | 'closed';
export type HistoryStatus = 'pagado' | 'parcial' | 'no_pagado';

export interface DepartmentHistoryRow {
  period_id: string;
  year: number;
  month: number;
  charge_amount: number;
  paid_amount: number;
  status: HistoryStatus;
}

@Injectable()
export class BillingPeriodsService {
  constructor(
    @Inject('SUPABASE') private readonly supabase: SupabaseClient,
    private readonly accessControl: AccessControlService,
  ) { }

  // Validar que el usuario pueda ver/editar ese edificio
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

  // Helper: rango [fromStr, toStr] para el mes
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

  // 1) Abrir mes: crea/actualiza periodo y genera deudas por depto
  async openPeriod(body: OpenPeriodDto, userId: number) {
    const { building_id, year, month, common_fee_amount } = body;

    await this.ensureUserCanAccessBuilding(building_id, userId);

    // ¿Existe ya el periodo?
    const { data: existingPeriods, error: findPeriodErr } = await this.supabase
      .from('billing_periods')
      .select('*')
      .eq('building_id', building_id)
      .eq('year', year)
      .eq('month', month);

    if (findPeriodErr) throw findPeriodErr;

    let period = existingPeriods?.[0];

    if (!period) {
      // Crear periodo
      const { data: newPeriod, error: createErr } = await this.supabase
        .from('billing_periods')
        .insert({
          building_id,
          year,
          month,
          common_fee_amount,
          status: 'open',
        })
        .select('*')
        .single();

      if (createErr) throw createErr;
      period = newPeriod;
    } else {
      // Actualizar monto y dejar en open
      const { data: updated, error: updateErr } = await this.supabase
        .from('billing_periods')
        .update({
          common_fee_amount,
          status: 'open',
        })
        .eq('id', period.id)
        .select('*')
        .single();

      if (updateErr) throw updateErr;
      period = updated;
    }

    // Obtener todos los deptos del edificio
    const { data: departments, error: deptErr } = await this.supabase
      .from('departments')
      .select('id')
      .eq('building_id', building_id);

    if (deptErr) throw deptErr;

    if (!departments || departments.length === 0) {
      return {
        period,
        message: 'Periodo abierto, pero el edificio no tiene departamentos.',
      };
    }

    // Generar deudas por depto (upsert para no duplicar si reabres)
    const rows = departments.map((d) => ({
      billing_period_id: period.id,
      department_id: d.id,
      charge_amount: common_fee_amount,
    }));

    const { error: upsertErr } = await this.supabase
      .from('billing_department_status')
      // @ts-ignore onConflict está soportado por supabase-js
      .upsert(rows, { onConflict: 'billing_period_id,department_id' });

    if (upsertErr) throw upsertErr;

    return { period, generated: rows.length };
  }

  // 2) Cambiar status (open / closed)
  async setStatus(id: string, status: PeriodStatus, userId: number) {
    const { data: period, error } = await this.supabase
      .from('billing_periods')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!period) throw new NotFoundException('Billing period not found');

    await this.ensureUserCanAccessBuilding(period.building_id, userId);

    const { data: updated, error: updateErr } = await this.supabase
      .from('billing_periods')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (updateErr) throw updateErr;
    return updated;
  }

  // 3) Resumen de un periodo: quién pagó / no pagó
  async getPeriodSummary(periodId: string, userId: number) {
    // Traer el periodo
    const { data: period, error: periodErr } = await this.supabase
      .from('billing_periods')
      .select('*')
      .eq('id', periodId)
      .single();

    if (periodErr) throw periodErr;
    if (!period) throw new NotFoundException('Billing period not found');

    // Validar acceso
    await this.ensureUserCanAccessBuilding(period.building_id, userId);

    // Rango de fechas del mes
    const { fromStr, toStr } = this.getMonthDateRange(period.year, period.month);

    // Deudas por depto
    const { data: chargesRaw, error: chargesErr } = await this.supabase
      .from('billing_department_status')
      .select(
        `
      id,
      charge_amount,
      department_id,
      departments (number)
    `,
      )
      .eq('billing_period_id', periodId);

    if (chargesErr) throw chargesErr;

    const charges = (chargesRaw || []) as any[];

    // 🔹 Lista de departamentos que tienen deuda en este periodo
    const deptIds = charges.map((c) => c.department_id).filter(Boolean);

    // 🔹 Pagos del mes para esos departamentos (solo tipo "Gasto común")
    const { data: payments, error: payErr } = await this.supabase
      .from('payments')
      .select('department_id, amount')
      .in('department_id', deptIds)            // 👈 usamos department_id, no building_id
      .eq('type_income', 'Gasto común')       // 👈 debe coincidir con el select del modal
      .gte('date', fromStr)
      .lte('date', toStr);

    if (payErr) throw payErr;

    // Mapear montos pagados por depto
    const paidMap = new Map<string, number>();
    (payments || []).forEach((p: any) => {
      if (!p.department_id) return;
      const current = paidMap.get(p.department_id) || 0;
      paidMap.set(p.department_id, current + (p.amount || 0));
    });

    // Armar resultado por depto
    const items = charges.map((c: any) => {
      const paidAmount = paidMap.get(c.department_id) || 0;

      // departments puede venir como objeto o array
      const rel = c.departments as any;
      const deptNumber = Array.isArray(rel) ? rel[0]?.number : rel?.number;

      let status: HistoryStatus = 'no_pagado';
      if (paidAmount >= c.charge_amount && c.charge_amount > 0) status = 'pagado';
      else if (paidAmount > 0 && paidAmount < c.charge_amount) status = 'parcial';

      return {
        department_id: c.department_id,
        department_number: deptNumber || '—',
        charge_amount: c.charge_amount,
        paid_amount: paidAmount,
        status,
      };
    });

    return {
      period: {
        id: period.id,
        year: period.year,
        month: period.month,
        status: period.status,
        common_fee_amount: period.common_fee_amount,
      },
      items,
    };
  }


  // 3-bis) Obtener resumen por building+year+month (sin crear periodo)
  async getSummaryByBuildingAndMonth(
    buildingId: string,
    year: number,
    month: number,
    userId: number,
  ) {
    // validar acceso
    await this.ensureUserCanAccessBuilding(buildingId, userId);

    // buscar periodo existente
    const { data: period, error: periodErr } = await this.supabase
      .from('billing_periods')
      .select('*')
      .eq('building_id', buildingId)
      .eq('year', year)
      .eq('month', month)
      .maybeSingle();

    if (periodErr) throw periodErr;

    if (!period) {
      throw new NotFoundException('No existe periodo para ese mes/año');
    }

    // reutilizamos el summary normal
    return this.getPeriodSummary(period.id, userId);
  }


  // 4) Histórico por depto (enero–mayo, etc.)
  async getDepartmentHistory(
    buildingId: string,
    departmentId: string,
    userId: number,
  ): Promise<DepartmentHistoryRow[]> {
    await this.ensureUserCanAccessBuilding(buildingId, userId);

    const { data: periodsRaw, error: periodErr } = await this.supabase
      .from('billing_periods')
      .select('*')
      .eq('building_id', buildingId)
      .order('year', { ascending: true })
      .order('month', { ascending: true });

    if (periodErr) throw periodErr;

    const periods = (periodsRaw || []) as any[];

    if (periods.length === 0) return [];

    const history: DepartmentHistoryRow[] = [];

    for (const p of periods) {
      const { fromStr, toStr } = this.getMonthDateRange(p.year, p.month);

      // Deuda del depto en ese periodo
      const { data: chargeRow, error: chargeErr } = await this.supabase
        .from('billing_department_status')
        .select('charge_amount')
        .eq('billing_period_id', p.id)
        .eq('department_id', departmentId)
        .maybeSingle();

      if (chargeErr) throw chargeErr;
      const chargeAmount = chargeRow?.charge_amount || 0;

      // Pagos del depto en ese mes
      const { data: payments, error: payErr } = await this.supabase
        .from('payments')
        .select('amount')
        .eq('building_id', buildingId)
        .eq('department_id', departmentId)
        .eq('type_income', 'Gasto común')
        .gte('date', fromStr)
        .lte('date', toStr);

      if (payErr) throw payErr;

      const paidAmount = (payments || []).reduce(
        (s: number, p: any) => s + (p.amount || 0),
        0,
      );

      let status: HistoryStatus = 'no_pagado';
      if (paidAmount >= chargeAmount && chargeAmount > 0) status = 'pagado';
      else if (paidAmount > 0 && paidAmount < chargeAmount) status = 'parcial';

      history.push({
        period_id: p.id,
        year: p.year,
        month: p.month,
        charge_amount: chargeAmount,
        paid_amount: paidAmount,
        status,
      });
    }

    return history;
  }
}
