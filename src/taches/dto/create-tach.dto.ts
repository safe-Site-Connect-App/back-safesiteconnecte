import { IsString, IsEnum, IsOptional, IsMongoId } from 'class-validator';

/**
 * DTO for creating a new task.
 */
export class CreateTacheDto {
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  titre: string;

  @IsString({ message: 'La description doit être une chaîne de caractères' })
  @IsOptional()
  description?: string;

  @IsEnum(['P1', 'P2', 'P3'], { message: 'La priorité doit être P1, P2 ou P3' })
  priorite: string;

  @IsString({ message: 'La zone doit être une chaîne de caractères' })
  @IsOptional()
  zone?: string;

  @IsEnum(['New', 'In Progress', 'Completed'], { message: 'Le statut doit être New, In Progress ou Completed' })
  @IsOptional()
  statut?: string;

  @IsMongoId({ message: 'L\'ID de l\'utilisateur assigné doit être un ID MongoDB valide' })
  assigneA: string;
}