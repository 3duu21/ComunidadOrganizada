// src/billing-periods/dto/open-period.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class OpenPeriodDto {
  @ApiProperty()
  @IsUUID()
  building_id: string;

  @ApiProperty()
  @IsInt()
  @Min(2000)
  year: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ description: 'Monto de gasto común por departamento' })
  @IsInt()
  @Min(0)
  common_fee_amount: number;
}
