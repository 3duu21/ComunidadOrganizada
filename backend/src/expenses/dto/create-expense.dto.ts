
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: 'd44a2c69-cc20-4e29-af3e-af79f63fb087' })
  building_id: string;

  @ApiProperty({ example: 90000 })
  amount: number;

  @ApiProperty({ example: 'Reparación de portón', required: false })
  description?: string;

  @ApiProperty({ example: '2025-01-10' })
  date?: string;

  @ApiProperty({
    example: 'mantencion',
    description: 'Tipo de gasto (mantencion, remuneracion, gastos_generales)'
  })
  type_expense: string;
}
