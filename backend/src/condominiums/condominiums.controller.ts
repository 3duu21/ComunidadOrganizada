import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CondominiumsService } from './condominiums.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('condominiums')
@UseGuards(JwtAuthGuard) // 👈 todas estas rutas requieren estar logeado
export class CondominiumsController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  // GET /condominiums -> SOLO los que tiene asociados el usuario
  @Get()
  async getMine(@Req() req: any) {
    const userId = req.user.userId;
    return this.condominiumsService.findForUser(userId);
  }

  // GET /condominiums/:id (opcional, validando acceso)
  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.condominiumsService.findOne(id, userId);
  }

  // POST /condominiums
  @Post()
  async create(@Body() body: { name: string }, @Req() req: any) {
    const userId = req.user.userId;
    return this.condominiumsService.create({ name: body.name }, userId);
  }

  // PATCH /condominiums/:id
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name: string },
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.condominiumsService.update(id, { name: body.name }, userId);
  }

  // DELETE /condominiums/:id
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.condominiumsService.remove(id, userId);
  }
}
