import { Controller, Post, Body, Get, Param, Put, Delete, Query } from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@ApiTags('Buildings')
@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  create(@Body() body: CreateBuildingDto) {
    return this.buildingsService.createBuilding(body);
  }

  // Se acepta query param ?condominium_id=...
  @Get()
  findAll(@Query('condominium_id') condominiumId?: string) {
    return this.buildingsService.getAllBuildings(condominiumId);
  }

  // Obtener uno
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.buildingsService.getBuilding(id);
  }

  // Editar edificio
  @Put(':id')
  @ApiBody({ type: UpdateBuildingDto })
  update(@Param('id') id: string, @Body() body: UpdateBuildingDto) {
    return this.buildingsService.updateBuilding(id, body);
  }

  // Eliminar edificio
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.buildingsService.deleteBuilding(id);
  }
}
