import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Ahmed Ben Ali', description: 'Nom complet', required: false })
  @IsString()
  @IsOptional()
  nom?: string;

  @ApiProperty({ 
    example: 'Manager', 
    description: 'Poste',
    enum: ['Technicien', 'Manager', 'Operator', 'Superviseur', 'Administrateur'],
    required: false 
  })
  @IsEnum(['Technicien', 'Manager', 'Operator', 'Superviseur', 'Administrateur'])
  @IsOptional()
  poste?: string;

  @ApiProperty({ 
    example: 'Management', 
    description: 'Département',
    enum: ['Technique', 'Management', 'Production', 'Qualité', 'Administration'],
    required: false 
  })
  @IsEnum(['Technique', 'Management', 'Production', 'Qualité', 'Administration'])
  @IsOptional()
  departement?: string;
}