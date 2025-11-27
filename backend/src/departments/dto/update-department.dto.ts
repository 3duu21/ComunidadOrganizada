import { IsString, IsUUID, IsOptional, IsNumber } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  building_id?: string;

  @IsOptional()
  @IsNumber()
  monthly_fee?: number;
}
