// src/parkings/parkings.module.ts
import { Module } from '@nestjs/common';
import { ParkingsService } from './parkings.service';
import { ParkingsController } from './parkings.controller';

@Module({
  controllers: [ParkingsController],
  providers: [ParkingsService],
})
export class ParkingsModule {}
