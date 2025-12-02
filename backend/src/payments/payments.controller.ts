import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CreatePaymentDto } from './dto/create-payments.dto';
import { UpdatePaymentDto } from './dto/update-payments.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  // Crear pago (ingreso)
  @Post()
  @ApiBody({ type: CreatePaymentDto })
  create(@Body() body: CreatePaymentDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.paymentsService.create(body, userId);
  }

  // ...
  @ApiQuery({ name: 'building_id', required: false })
  @ApiQuery({ name: 'condominium_id', required: false })
  @ApiQuery({ name: 'type_income', required: false })
  @ApiQuery({ name: 'department_id', required: false }) // 👈 NUEVO
  @Get()
  find(
    @Query('building_id') buildingIdRaw: string,
    @Query('condominium_id') condoIdRaw: string,
    @Query('type_income') typeIncomeRaw: string,
    @Query('department_id') departmentIdRaw: string, // 👈 NUEVO
    @Req() req: any,
  ) {
    const userId = req.user.userId;

    const buildingId =
      buildingIdRaw && buildingIdRaw !== 'undefined' && buildingIdRaw !== ''
        ? buildingIdRaw
        : undefined;

    const condoId =
      condoIdRaw && condoIdRaw !== 'undefined' && condoIdRaw !== ''
        ? condoIdRaw
        : undefined;

    const typeIncome =
      typeIncomeRaw && typeIncomeRaw !== 'undefined' && typeIncomeRaw !== ''
        ? typeIncomeRaw
        : undefined;

    const departmentId =
      departmentIdRaw && departmentIdRaw !== 'undefined' && departmentIdRaw !== ''
        ? departmentIdRaw
        : undefined;

    return this.paymentsService.findByFilter(
      buildingId,
      condoId,
      typeIncome,
      departmentId, // 👈 NUEVO
      userId,
    );
  }


  // Tipos de ingreso (lista para el select)
  @Get('/types/list')
  getTypes() {
    return this.paymentsService.getTypes();
  }

  // Obtener pago por ID
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.paymentsService.findOne(id, userId);
  }

  // Editar pago
  @Put(':id')
  @ApiBody({ type: UpdatePaymentDto })
  update(
    @Param('id') id: string,
    @Body() body: UpdatePaymentDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.paymentsService.update(id, body, userId);
  }

  // Eliminar pago
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.paymentsService.remove(id, userId);
  }
}
