import { IsString, IsUUID, IsNumber } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsUUID()
  building_id: string;

  @IsNumber()
  monthly_fee: number;
}
