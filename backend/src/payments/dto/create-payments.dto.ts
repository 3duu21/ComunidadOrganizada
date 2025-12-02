// create-payments.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  building_id: string;

  @ApiProperty()
  @IsUUID()
  department_id: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiProperty({
    required: false,
    example: 'Transferencia',
  })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiProperty({
    required: false,
    example: 'TRX-12345',
  })
  @IsOptional()
  @IsString()
  document_number?: string;

  // 👇 IMPORTANTE
  @ApiProperty({
    required: false,
    example: 'Gasto común',
    description: 'Tipo de ingreso (GC, multa, etc.)',
  })
  @IsOptional()
  @IsString()
  type_income?: string;
}
