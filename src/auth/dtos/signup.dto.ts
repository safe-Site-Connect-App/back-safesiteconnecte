import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsNotEmpty } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'Ahmed Ben Ali', description: 'Nom complet de l\'utilisateur' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 'ahmed@example.com', description: 'Adresse email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'motdepasse123', description: 'Mot de passe' })
  @IsString()
  @MinLength(6)
  motdepasse: string;

  @ApiProperty({ example: 'motdepasse123', description: 'Confirmation du mot de passe' })
  @IsString()
  @MinLength(6)
  confirmMotdepasse: string;

  @ApiProperty({ 
    example: 'Employee', 
    description: 'Rôle de l\'utilisateur',
    enum: ['Employee', 'Admin'] 
  })
  @IsEnum(['Employee', 'Admin'])
  role: string;

  @ApiProperty({ 
    example: 'Technicien', 
    description: 'Poste de l\'utilisateur',
    enum: ['Technicien', 'Manager', 'Operator', 'Superviseur', 'Administrateur'] 
  })
  @IsEnum(['Technicien', 'Manager', 'Operator', 'Superviseur', 'Administrateur'])
  poste: string;

  @ApiProperty({ 
    example: 'Technique', 
    description: 'Département de l\'utilisateur',
    enum: ['Technique', 'Management', 'Production', 'Qualité', 'Administration'] 
  })
  @IsEnum(['Technique', 'Management', 'Production', 'Qualité', 'Administration'])
  departement: string;
}