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
import { DepartmentsService } from './departments.service';
import { ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BadRequestException } from '@nestjs/common';

@ApiTags('Departments')
@Controller('departments')
@UseGuards(JwtAuthGuard) // 👈 todas las rutas requieren estar logeado
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) { }

  @Post()
  @ApiBody({ type: CreateDepartmentDto })
  create(@Body() body: CreateDepartmentDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.departmentsService.create(body, userId);
  }

  // GET /departments?building_id=...
  @Get()
  @ApiQuery({ name: 'building_id', required: true })
  find(@Query('building_id') buildingIdRaw: string, @Req() req: any) {
    const userId = req.user.userId;

    const buildingId =
      buildingIdRaw && buildingIdRaw !== 'undefined' && buildingIdRaw !== ''
        ? buildingIdRaw
        : undefined;

    // si aquí es requerido, puedes lanzar error si no viene
    if (!buildingId) {
      throw new BadRequestException('building_id es requerido');
    }

    return this.departmentsService.findByBuilding(buildingId, userId);
  }


  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.departmentsService.findOne(id, userId);
  }

  @Put(':id')
  @ApiBody({ type: UpdateDepartmentDto })
  update(
    @Param('id') id: string,
    @Body() body: UpdateDepartmentDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.departmentsService.update(id, body, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.departmentsService.remove(id, userId);
  }

  // src/departments/departments.controller.ts

  @Post(':id/create-owner-access')
  async createOwnerAccess(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { password?: string },
  ) {
    const userId = req.user.userId; // admin logeado
    return this.departmentsService.createOwnerAccess(id, userId, body.password);
  }

}
