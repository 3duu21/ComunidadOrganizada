// create-department.dto.ts
import { IsString, IsUUID, IsOptional, IsNumber, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty()
  @IsUUID()
  building_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  floor?: number;

  @ApiProperty()
  @IsString()
  number: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  monthly_fee?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  owner_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  owner_email?: string;
}
