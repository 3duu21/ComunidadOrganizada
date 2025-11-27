import { Controller, Post, Body, Get, Param, Put, Delete, Query } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { CreateExpenseDto } from './dto/create-expense.dto';

@ApiTags('Expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  // Crear gasto
  @Post()
  @ApiBody({ type: CreateExpenseDto })
  create(@Body() body: CreateExpenseDto) {
    return this.expensesService.create(body);
  }

  // Listar gastos con filtros opcionales
  @Get()
  find(
    @Query('building_id') building_id?: string,
    @Query('type_expense') type_expense?: string,
  ) {
    return this.expensesService.findFiltered({
      building_id,
      type_expense,
    });
  }

  // Obtener gasto por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  // Editar gasto
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.expensesService.update(id, body);
  }

  // Eliminar gasto
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }

  // Tipos de gasto
  @Get('/types/list')
  getTypes() {
    return this.expensesService.getTypes();
  }
}
