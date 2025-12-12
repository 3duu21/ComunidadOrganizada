import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { AccessControlService } from '../access-control/access-control.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DepartmentsService {
  constructor(
    @Inject('SUPABASE') private supabase: SupabaseClient,
    private readonly accessControl: AccessControlService,
  ) { }

  // Helper: obtiene el edificio y valida que el user tenga acceso a su condominio
  private async ensureUserCanAccessBuilding(
    buildingId: string,
    userId: number,
  ) {
    const { data: building, error } = await this.supabase
      .from('buildings')
      .select('*')
      .eq('id', buildingId)
      .single();

    if (error) throw error;
    if (!building) throw new NotFoundException('Building not found');

    await this.accessControl.ensureUserHasAccessToCondominium(
      userId,
      building.condominium_id,
    );

    return building;
  }

  // Crear departamento
  async create(data: CreateDepartmentDto, userId: number) {
    // 1) Validar acceso al edificio (y por ende, al condominio)
    const building = await this.ensureUserCanAccessBuilding(
      data.building_id,
      userId,
    );

    // 2) Obtener usuario con su plan
    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('id, plan_id')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const planId = user.plan_id || 'trial';

    const { data: plan, error: planError } = await this.supabase
      .from('plans')
      .select('id, max_departments_per_condo')
      .eq('id', planId)
      .maybeSingle();

    if (planError) throw planError;

    // 3) Validar límite de departamentos por condominio según el plan
    if (plan?.max_departments_per_condo != null) {
      // 3.1) Obtener todos los edificios del mismo condominio
      const { data: buildings, error: buildingsError } = await this.supabase
        .from('buildings')
        .select('id')
        .eq('condominium_id', building.condominium_id);

      if (buildingsError) throw buildingsError;

      const buildingIds = (buildings || []).map((b) => b.id);

      if (buildingIds.length > 0) {
        // 3.2) Contar todos los departamentos de esos edificios
        const { count, error: countError } = await this.supabase
          .from('departments')
          .select('*', { count: 'exact', head: true })
          .in('building_id', buildingIds);

        if (countError) throw countError;

        const currentCount = count ?? 0;

        if (currentCount >= plan.max_departments_per_condo) {
          throw new BadRequestException(
            'Has alcanzado el número máximo de departamentos permitidos para este condominio según tu plan. Actualiza tu plan para agregar más departamentos.',
          );
        }
      }
    }

    // 4) Crear departamento
    const { data: result, error } = await this.supabase
      .from('departments')
      .insert({
        building_id: data.building_id,
        floor: data.floor,
        number: data.number,
        monthly_fee: data.monthly_fee,
        owner_name: data.owner_name,
        owner_email: data.owner_email,
      })
      .select('*')
      .single();

    if (error) throw error;
    return result;
  }

  // Listar departamentos por edificio
  async findByBuilding(buildingId: string, userId: number) {
    await this.ensureUserCanAccessBuilding(buildingId, userId);

    const { data, error } = await this.supabase
      .from('departments')
      .select('*, department_users(id)')
      .eq('building_id', buildingId);

    if (error) throw error;
    return data;
  }

  // Obtener uno por ID
  async findOne(id: string, userId: number) {
    const { data: department, error } = await this.supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!department) throw new NotFoundException('Department not found');

    // Validar acceso usando el building_id del depto
    await this.ensureUserCanAccessBuilding(department.building_id, userId);

    return department;
  }

  // Editar departamento
  async update(id: string, data: UpdateDepartmentDto, userId: number) {
    // Obtener el depto actual para saber a qué edificio/condominio pertenece
    const { data: existing, error: errorExisting } = await this.supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (errorExisting) throw errorExisting;
    if (!existing) throw new NotFoundException('Department not found');

    await this.ensureUserCanAccessBuilding(existing.building_id, userId);

    const { data: result, error } = await this.supabase
      .from('departments')
      .update({
        floor: data.floor ?? existing.floor,
        number: data.number ?? existing.number,
        monthly_fee: data.monthly_fee ?? existing.monthly_fee,
        owner_name: data.owner_name ?? existing.owner_name,
        owner_email: data.owner_email ?? existing.owner_email,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return result;
  }

  // Eliminar departamento
  async remove(id: string, userId: number) {
    // Validar primero que el depto exista y a qué edificio pertenece
    const { data: existing, error: errorExisting } = await this.supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (errorExisting) throw errorExisting;
    if (!existing) throw new NotFoundException('Department not found');

    await this.ensureUserCanAccessBuilding(existing.building_id, userId);

    const { error } = await this.supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Department deleted successfully' };
  }

  // Crear acceso de propietario a partir de los datos del departamento
  async createOwnerAccess(
    departmentId: string,
    adminUserId: number,
    plainPassword?: string,
  ) {
    // 1) Obtener depto
    const { data: department, error: deptError } = await this.supabase
      .from('departments')
      .select('id, building_id, owner_name, owner_email')
      .eq('id', departmentId)
      .single();

    if (deptError) throw deptError;
    if (!department) throw new NotFoundException('Department not found');

    // 2) Validar acceso del admin al condominio del depto
    const building = await this.ensureUserCanAccessBuilding(
      department.building_id,
      adminUserId,
    );

    // 3) Validar que el admin tenga plan con portal de propietarios
    const { data: adminUser, error: userError } = await this.supabase
      .from('users')
      .select('id, plan_id')
      .eq('id', adminUserId)
      .single();

    if (userError) throw userError;
    if (!adminUser) throw new ForbiddenException('Usuario no encontrado');

    const planId = adminUser.plan_id || 'trial';

    const { data: plan, error: planError } = await this.supabase
      .from('plans')
      .select('id, allow_owner_portal')
      .eq('id', planId)
      .maybeSingle();

    if (planError) throw planError;

    if (!plan?.allow_owner_portal) {
      throw new BadRequestException(
        'Tu plan actual no incluye portal de propietarios. Mejora tu plan para poder crear accesos de propietarios.',
      );
    }

    // 4) Validar que el depto tenga correo de propietario
    if (!department.owner_email) {
      throw new BadRequestException(
        'Este departamento no tiene un correo de propietario registrado. Agrega un correo antes de crear el acceso.',
      );
    }

    const ownerEmail = department.owner_email;
    const ownerName = department.owner_name || 'Propietario';

    // 5) Ver si ya existe un usuario con ese correo
    const { data: existingUser, error: existingUserError } = await this.supabase
      .from('users')
      .select('id, role')
      .eq('email', ownerEmail)
      .maybeSingle();

    if (existingUserError) throw existingUserError;

    let ownerUserId: number;
    let generatedPassword: string | null = null;
    let userCreated = false;

    if (existingUser) {
      ownerUserId = existingUser.id;

      // 🔁 Si viene una contraseña nueva, actualizamos la clave del propietario
      if (plainPassword && plainPassword.trim().length >= 6) {
        const passwordToUse = plainPassword.trim();
        const passwordHash = await bcrypt.hash(passwordToUse, 10);

        const { error: updateUserError } = await this.supabase
          .from('users')
          .update({ password_hash: passwordHash })
          .eq('id', ownerUserId);

        if (updateUserError) throw updateUserError;

        generatedPassword = passwordToUse; // para devolverla al front
      }
    } else {
      // 6) Crear usuario nuevo con rol owner
      const passwordToUse =
        plainPassword && plainPassword.trim().length >= 6
          ? plainPassword.trim()
          : Math.random().toString(36).slice(2, 10); // password temporal

      const passwordHash = await bcrypt.hash(passwordToUse, 10);

      const { data: newUser, error: newUserError } = await this.supabase
        .from('users')
        .insert({
          email: ownerEmail,
          name: ownerName,
          role: 'owner',
          password_hash: passwordHash,
        })
        .select('id')
        .single();

      if (newUserError) throw newUserError;
      ownerUserId = newUser.id;
      userCreated = true;
      generatedPassword = passwordToUse;
    }

    // 7) Asociar usuario al condominio (user_condominiums)
    const { data: condoLink, error: condoLinkError } = await this.supabase
      .from('user_condominiums')
      .select('id')
      .eq('user_id', ownerUserId)
      .eq('condominium_id', building.condominium_id)
      .maybeSingle();

    if (condoLinkError) throw condoLinkError;

    if (!condoLink) {
      const { error: insertCondoLinkError } = await this.supabase
        .from('user_condominiums')
        .insert({
          user_id: ownerUserId,
          condominium_id: building.condominium_id,
          role: 'owner',
        });

      if (insertCondoLinkError) throw insertCondoLinkError;
    }

    // 8) Asociar usuario al departamento (department_users)
    const { data: deptLink, error: deptLinkError } = await this.supabase
      .from('department_users')
      .select('id')
      .eq('user_id', ownerUserId)
      .eq('department_id', department.id)
      .maybeSingle();

    if (deptLinkError) throw deptLinkError;

    if (!deptLink) {
      const { error: insertDeptLinkError } = await this.supabase
        .from('department_users')
        .insert({
          user_id: ownerUserId,
          department_id: department.id,
        });

      if (insertDeptLinkError) throw insertDeptLinkError;
    }

    return {
      success: true,
      userCreated,
      email: ownerEmail,
      generatedPassword, // 👈 si se creó nuevo user, le devuelves la clave temporal al admin
    };
  }

}
