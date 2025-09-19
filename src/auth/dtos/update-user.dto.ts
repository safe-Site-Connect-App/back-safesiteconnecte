// Create this file: src/auth/dtos/update-user.dto.ts

import { IsOptional, IsString, IsEnum, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ 
    description: 'User full name',
    example: 'John Doe',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(50, { message: 'Le nom ne peut pas dépasser 50 caractères' })
  nom?: string;

  @ApiProperty({ 
    description: 'User position',
    enum: ['Technicien', 'Manager', 'Operator', 'Superviseur', 'Administrateur'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['Technicien', 'Manager', 'Operator', 'Superviseur', 'Administrateur'], {
    message: 'Le poste doit être: Technicien, Manager, Operator, Superviseur, ou Administrateur'
  })
  poste?: string;

  @ApiProperty({ 
    description: 'User department',
    enum: ['Technique', 'Management', 'Production', 'Qualité', 'Administration'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['Technique', 'Management', 'Production', 'Qualité', 'Administration'], {
    message: 'Le département doit être: Technique, Management, Production, Qualité, ou Administration'
  })
  departement?: string;

  @ApiProperty({ 
    description: 'User role (Admin only)',
    enum: ['Employee', 'Admin'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['Employee', 'Admin'], {
    message: 'Le rôle doit être: Employee ou Admin'
  })
  role?: string;

  @ApiProperty({ 
    description: 'User active status (Admin only)',
    example: true,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}