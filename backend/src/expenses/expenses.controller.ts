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
  ForbiddenException,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';



@ApiTags('Expenses')
@Controller('expenses')
@UseGuards(JwtAuthGuard) // 👈 todas las rutas de gastos requieren login
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) { }

  // Crear gasto
  @Post()
  @ApiBody({ type: CreateExpenseDto })
  create(@Body() body: CreateExpenseDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.expensesService.create(body, userId);
  }

  // Listar gastos con filtros opcionales
  // Listar gastos con filtros opcionales
  @Get()
  @ApiQuery({ name: 'building_id', required: false })
  @ApiQuery({ name: 'type_expense', required: false })
  find(
    @Req() req: any,
    @Query('building_id') buildingIdRaw?: string,
    @Query('type_expense') typeExpense?: string,
  ) {
    const userId = req.user.userId;

    const building_id =
      buildingIdRaw &&
        buildingIdRaw !== 'undefined' &&
        buildingIdRaw !== ''
        ? buildingIdRaw
        : undefined;

    if (!building_id) {
      throw new ForbiddenException(
        'Se requiere building_id para listar gastos',
      );
    }

    return this.expensesService.findFiltered(
      {
        building_id,
        type_expense: typeExpense,
      },
      userId,
    );
  }


  // Obtener gasto por ID
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.expensesService.findOne(id, userId);
  }

  // Editar gasto
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const userId = req.user.userId;
    return this.expensesService.update(id, body, userId);
  }

  // Eliminar gasto
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.expensesService.remove(id, userId);
  }

  // Tipos de gasto
  @Get('/types/list')
  getTypes() {
    return this.expensesService.getTypes();
  }
}
