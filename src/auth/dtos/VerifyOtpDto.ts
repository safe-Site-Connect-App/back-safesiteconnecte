import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '1234', description: 'Code OTP à 4 chiffres' })
  @IsString()
  @Length(4, 4)
  otp: string;
}