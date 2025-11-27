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
export class CondominiumsController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  // 🔐 GET /condominiums/my  -> solo mis condominios (requiere token)
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyCondominiums(@Req() req) {
    const userId = req.user.userId; // viene del JWT
    return this.condominiumsService.findForUser(userId);
  }

  // GET /condominiums  (lista todos - si después quieres, se puede proteger también)
  @Get()
  async getAll() {
    return this.condominiumsService.findAll();
  }

  // GET /condominiums/:id
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.condominiumsService.findOne(id);
  }

  // POST /condominiums
  @Post()
  async create(@Body() body: { name: string }) {
    return this.condominiumsService.create({ name: body.name });
  }

  // PATCH /condominiums/:id
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { name: string }) {
    return this.condominiumsService.update(id, { name: body.name });
  }

  // DELETE /condominiums/:id
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.condominiumsService.remove(id);
  }
}
