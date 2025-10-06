// ==================== create-alerte.dto.ts ====================
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreateAlerteDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est requis' })
  titre: string;

  @IsString()
  @IsNotEmpty({ message: 'La description est requise' })
  description: string;

  @IsEnum(['Critique', 'Modérée', 'Mineure'], {
    message: 'La priorité doit être Critique, Modérée ou Mineure',
  })
  @IsNotEmpty({ message: 'La priorité est requise' })
  priorite: string;

  @IsString()
  @IsOptional()
  lieu?: string;

  @IsEnum(['New', 'In Progress', 'Resolved'], {
    message: 'Le statut doit être New, In Progress ou Resolved',
  })
  @IsOptional()
  statut?: string = 'New';
}
