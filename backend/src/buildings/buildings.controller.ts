import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BuildingsService } from './buildings.service';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Buildings')
@Controller('buildings')
@UseGuards(JwtAuthGuard) // 👈 Todas las rutas de edificios requieren estar logeado
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}

  @Post()
  create(@Body() body: CreateBuildingDto, @Req() req: any) {
    // Opcional: podríamos validar aquí si el user tiene acceso al condominium_id del body
    return this.buildingsService.createBuilding(body, req.user.userId);
  }

  // GET /buildings?condominium_id=...
  @Get()
  findAll(
    @Query('condominium_id') condominiumId: string,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.buildingsService.getAllBuildings(condominiumId, userId);
  }

  // Obtener uno
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.buildingsService.getBuilding(id, userId);
  }

  // Editar edificio
  @Put(':id')
  @ApiBody({ type: UpdateBuildingDto })
  update(
    @Param('id') id: string,
    @Body() body: UpdateBuildingDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.buildingsService.updateBuilding(id, body, userId);
  }

  // Eliminar edificio
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.buildingsService.deleteBuilding(id, userId);
  }
}
