import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID()
  building_id: string;

  @ApiProperty()
  @IsUUID()
  apartment_id: string;

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
}
