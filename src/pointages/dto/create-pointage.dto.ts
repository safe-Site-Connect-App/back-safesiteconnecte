import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreatePointageDto {
  @IsNotEmpty({ message: 'Le type est requis' })
  @IsEnum(['ENTREE', 'SORTIE'], { message: 'Le type doit être ENTREE ou SORTIE' })
  type: 'ENTREE' | 'SORTIE';

  @IsNotEmpty({ message: 'L\'heure est requise' })
  @IsString({ message: 'L\'heure doit être une chaîne de caractères' })
  @Matches(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, { 
    message: 'L\'heure doit être au format HH:mm (ex: 08:30)' 
  })
  heure: string;

  @IsNotEmpty({ message: 'La date est requise' })
  @IsString({ message: 'La date doit être une chaîne de caractères' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { 
    message: 'La date doit être au format YYYY-MM-DD (ex: 2025-10-05)' 
  })
  date: string;
}
