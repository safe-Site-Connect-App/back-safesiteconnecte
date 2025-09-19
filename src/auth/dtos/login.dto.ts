import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ahmed@example.com', description: 'Adresse email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'motdepasse123', description: 'Mot de passe' })
  @IsString()
  @IsNotEmpty()
  motdepasse: string;
}