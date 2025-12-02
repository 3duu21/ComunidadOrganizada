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
  apartment_id: string; // 👈 si en tu BD es department_id, después lo podemos alinear

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
    example: 'TRX-12345',
  })
  @IsOptional()
  @IsString()
  document_number?: string;
}
