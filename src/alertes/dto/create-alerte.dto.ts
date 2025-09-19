import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAlerteDto {
  @IsString()
  @IsNotEmpty()
  titre: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['Critique', 'Modérée', 'Mineure'])
  priorite: string;

  @IsString()
  @IsOptional()
  lieu?: string;

  @IsEnum(['New', 'In Progress', 'Resolved'])
  @IsOptional()
  statut?: string;
}
