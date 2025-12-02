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
  constructor(private readonly paymentsService: PaymentsService) {}

  // Crear pago
  @Post()
  @ApiBody({ type: CreatePaymentDto })
  create(@Body() body: CreatePaymentDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.paymentsService.create(body, userId);
  }

  @Get()
  @ApiQuery({ name: 'building_id', required: false })
  @ApiQuery({ name: 'condominium_id', required: false })
  find(
    @Query('building_id') buildingIdRaw: string,
    @Query('condominium_id') condoIdRaw: string,
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

    return this.paymentsService.findByFilter(buildingId, condoId, userId);
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
