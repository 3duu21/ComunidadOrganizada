import { ApiProperty } from '@nestjs/swagger';

export class BalanceResponseDto {
  @ApiProperty({ example: 250000 })
  total_payments: number;

  @ApiProperty({ example: 90000 })
  total_expenses: number;

  @ApiProperty({ example: 160000 })
  balance: number;
}
