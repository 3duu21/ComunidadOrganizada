import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class BalanceService {
  constructor(
    @Inject('SUPABASE') private readonly supabase: SupabaseClient,
  ) { }

  async getMonthlyBalance(buildingId: string, year: string, month: string) {
    const y = Number(year);
    const m = Number(month);

    if (!y || !m || m < 1 || m > 12) {
      throw new Error('Invalid year or month');
    }

    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // 1) Departamentos
    const { data: departments } = await this.supabase
      .from('departments')
      .select('id')
      .eq('building_id', buildingId);

    const departmentIds = (departments || []).map(d => d.id);

    // 2) Pagos (solo si hay departamentos)
    let totalPayments = 0;

    if (departmentIds.length > 0) {
      const { data: payments } = await this.supabase
        .from('payments')
        .select('amount')
        .in('department_id', departmentIds)
        .gte('date', startDate)
        .lte('date', endDate);

      totalPayments = (payments || []).reduce((sum, p) => sum + p.amount, 0);
    }

    // 3) Gastos (esto SIEMPRE debe ejecutarse)
    const { data: expenses } = await this.supabase
      .from('expenses')
      .select('amount')
      .eq('building_id', buildingId)
      .gte('date', startDate)
      .lte('date', endDate);

    const totalExpenses = (expenses || []).reduce((sum, e) => sum + e.amount, 0);

    // 4) Resultado final
    return {
      total_payments: totalPayments,
      total_expenses: totalExpenses,
      balance: totalPayments - totalExpenses,
    };
  }

}
