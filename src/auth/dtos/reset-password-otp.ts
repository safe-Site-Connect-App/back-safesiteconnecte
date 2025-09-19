import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordOtpDto {
  @ApiProperty({ example: 'nouveauMotdepasse123', description: 'Nouveau mot de passe' })
  @IsString()
  @MinLength(6)
  password: string;
}