import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OtpVerificationDto {
  @ApiProperty({
    description: 'Le mot de passe de l\'utilisateur pour la vérification OTP',
    type: String,
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'La confirmation du mot de passe pour la vérification OTP',
    type: String,
  })
  @IsString()
  confirmPassword: string;
}
