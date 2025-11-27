import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiBody({ type: CreateDepartmentDto })
  create(@Body() body: CreateDepartmentDto) {
    return this.departmentsService.create(body);
  }

  @Get()
  @ApiQuery({ name: 'building_id', required: true })
  find(@Query('building_id') building_id: string) {
    return this.departmentsService.findByBuilding(building_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Put(':id')
  @ApiBody({ type: UpdateDepartmentDto })
  update(@Param('id') id: string, @Body() body: UpdateDepartmentDto) {
    return this.departmentsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
