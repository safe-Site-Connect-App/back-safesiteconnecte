import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'ancienMotdepasse123', description: 'Ancien mot de passe' })
  @IsString()
  @IsNotEmpty()
  ancienMotdepasse: string;

  @ApiProperty({ example: 'nouveauMotdepasse123', description: 'Nouveau mot de passe' })
  @IsString()
  @MinLength(6)
  nouveauMotdepasse: string;
}