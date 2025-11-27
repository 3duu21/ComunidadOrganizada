// src/parkings/parkings.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ParkingsService } from './parkings.service';

@Controller('parkings')
export class ParkingsController {
  constructor(private readonly parkingsService: ParkingsService) {}

  // GET /parkings  o  GET /parkings?departmentId=...
  @Get()
  async find(@Query('departmentId') departmentId?: string) {
    if (departmentId) {
      return this.parkingsService.findByDepartment(departmentId);
    }
    return this.parkingsService.findAll();
  }

  @Post()
  async create(@Body() body: any) {
    try {
      return await this.parkingsService.create(body);
    } catch (err: any) {
      console.error('🔴 Error en controller CREATE parking:', err);

      // Si viene el error crudo de Supabase (Object con code, details, message)
      const code = err?.code;
      const msg =
        typeof err?.message === 'string'
          ? err.message.toLowerCase()
          : '';
      const details =
        typeof err?.details === 'string'
          ? err.details.toLowerCase()
          : '';

      if (
        code === '23505' ||
        msg.includes('duplicate key value') ||
        details.includes('uniq_parking_number_per_condominium') ||
        details.includes('uniq_parking_per_department') ||
        details.includes('already exists')
      ) {
        throw new BadRequestException(
          'Este estacionamiento ya está ocupado en este condominio.',
        );
      }

      // Si ya es una HttpException (BadRequestException del service), la relanzamos
      if (err?.status && err?.response) {
        throw err;
      }

      throw new InternalServerErrorException('Error al crear estacionamiento');
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.parkingsService.update(id, body);
    } catch (err: any) {
      console.error('🔴 Error en controller UPDATE parking:', err);

      const code = err?.code;
      const msg =
        typeof err?.message === 'string'
          ? err.message.toLowerCase()
          : '';
      const details =
        typeof err?.details === 'string'
          ? err.details.toLowerCase()
          : '';

      if (
        code === '23505' ||
        msg.includes('duplicate key value') ||
        details.includes('uniq_parking_number_per_condominium') ||
        details.includes('uniq_parking_per_department') ||
        details.includes('already exists')
      ) {
        throw new BadRequestException(
          'Este estacionamiento ya está ocupado en este condominio.',
        );
      }

      if (err?.status && err?.response) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Error al actualizar estacionamiento',
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.parkingsService.remove(id);
    } catch (err: any) {
      console.error('🔴 Error en controller DELETE parking:', err);

      if (err?.status && err?.response) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Error al eliminar estacionamiento',
      );
    }
  }
}
