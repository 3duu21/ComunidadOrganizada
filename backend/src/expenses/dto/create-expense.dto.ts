// src/expenses/dto/create-expense.dto.ts
import {
  IsString,
  IsUUID,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty()
  @IsUUID()
  building_id: string;

  @ApiProperty({ example: '2025-11-22' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'Remuneraciones y Gastos de Administracion',
  })
  @IsString()
  type_expense: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  // 🔹 NUEVO: método de pago
  @ApiProperty({
    required: false,
    example: 'Transferencia',
  })
  @IsOptional()
  @IsString()
  payment_method?: string;

  // 🔹 NUEVO: número de documento
  @ApiProperty({
    required: false,
    example: 'F-12345',
  })
  @IsOptional()
  @IsString()
  document_number?: string;
}
