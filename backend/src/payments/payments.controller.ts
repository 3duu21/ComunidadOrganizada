import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CreatePaymentDto } from './dto/create-payments.dto';
import { UpdatePaymentDto } from './dto/update-payments.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  // Crear pago
  @Post()
  @ApiBody({ type: CreatePaymentDto })
  create(@Body() body: CreatePaymentDto) {
    return this.paymentsService.create(body);
  }

  // Listar pagos por edificio
  @Get()
  @ApiQuery({ name: 'building_id', required: false })
  @ApiQuery({ name: 'condominium_id', required: false })
  find(@Query('building_id') buildingId: string, @Query('condominium_id') condoId: string) {
    return this.paymentsService.findByFilter(buildingId, condoId);
  }


  // Obtener pago por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  // Editar pago
  @Put(':id')
  @ApiBody({ type: UpdatePaymentDto })
  update(@Param('id') id: string, @Body() body: UpdatePaymentDto) {
    return this.paymentsService.update(id, body);
  }

  // Eliminar pago
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
