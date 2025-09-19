import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTacheDto {
  @IsNotEmpty()
  @IsString()
  titre: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['P1', 'P2', 'P3'])
  priorite: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsEnum(['New', 'In Progress', 'Completed'])
  statut: string;

  @IsNotEmpty()
  assigneA: string; // ID user
}
