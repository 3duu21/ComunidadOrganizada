// src/buildings/dto/create-building.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBuildingDto {
  @ApiProperty({ description: 'Nombre del edificio' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Dirección del edificio', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'ID del condominio al que pertenece' })
  @IsNotEmpty()
  @IsString()
  condominium_id: string;  // 🔹 agregar esto
}
