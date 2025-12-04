// src/billing-periods/billing-periods.controller.ts
import {
    Controller,
    Post,
    Patch,
    Get,
    Body,
    Param,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
    BillingPeriodsService,
    DepartmentHistoryRow,
} from './billing-periods.service';
import { OpenPeriodDto } from './dto/open-period.dto';

@ApiTags('BillingPeriods')
@Controller('billing-periods')
@UseGuards(JwtAuthGuard)
export class BillingPeriodsController {
    constructor(private readonly service: BillingPeriodsService) { }

    // 1) Abrir periodo y generar deudas
    @Post('open')
    @ApiBody({ type: OpenPeriodDto })
    open(@Body() body: OpenPeriodDto, @Req() req: any) {
        const userId = req.user.userId;
        return this.service.openPeriod(body, userId);
    }

    // 2) Cerrar periodo
    @Patch(':id/close')
    close(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.userId;
        return this.service.setStatus(id, 'closed', userId);
    }

    // 3) Reabrir periodo
    @Patch(':id/open')
    reopen(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.userId;
        return this.service.setStatus(id, 'open', userId);
    }
    // 4-bis) Buscar resumen por building + year + month
    @Get('search')
    @ApiQuery({ name: 'building_id', required: true })
    @ApiQuery({ name: 'year', required: true })
    @ApiQuery({ name: 'month', required: true })
    searchSummary(
        @Query('building_id') buildingId: string,
        @Query('year') yearStr: string,
        @Query('month') monthStr: string,
        @Req() req: any,
    ) {
        const userId = req.user.userId;
        const year = Number(yearStr);
        const month = Number(monthStr);
        return this.service.getSummaryByBuildingAndMonth(
            buildingId,
            year,
            month,
            userId,
        );
    }


    // 4) Resumen pagado / no pagado de un periodo (JSON)
    @Get(':id/summary')
    getSummary(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.userId;
        return this.service.getPeriodSummary(id, userId);
    }

    // 5) Descargar resumen en CSV
    @Get(':id/summary/export')
    async exportSummary(
        @Param('id') id: string,
        @Req() req: any,
        @Res() res: any,
    ) {

        const userId = req.user.userId;
        const summary = await this.service.getPeriodSummary(id, userId);

        const header = 'department_number,charge_amount,paid_amount,status\n';

        const lines = summary.items.map((item) =>
            [
                item.department_number,
                item.charge_amount,
                item.paid_amount,
                item.status,
            ]
                .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                .join(','),
        );

        const csv = header + lines.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="periodo_${summary.period.year}_${summary.period.month}.csv"`,
        );

        return res.send(csv);
    }

    // 6) Histórico por depto: enero–mayo, etc.
    @Get('history/by-department')
    @ApiQuery({ name: 'building_id', required: true })
    @ApiQuery({ name: 'department_id', required: true })
    historyByDepartment(
        @Query('building_id') buildingId: string,
        @Query('department_id') departmentId: string,
        @Req() req: any,
    ): Promise<DepartmentHistoryRow[]> {
        const userId = req.user.userId;
        return this.service.getDepartmentHistory(buildingId, departmentId, userId);
    }
}
