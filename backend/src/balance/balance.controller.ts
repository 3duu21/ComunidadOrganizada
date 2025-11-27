import { Controller, Get, Query } from '@nestjs/common';
import { BalanceService } from './balance.service';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) { }

  @Get()
  async getBalance(
    @Query('building_id') buildingId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.balanceService.getMonthlyBalance(buildingId, year, month);
  }

}
