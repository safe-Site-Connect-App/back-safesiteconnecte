import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Le token de rafraîchissement utilisé pour obtenir un nouveau token d\'accès',
    type: String,
  })
  @IsString()
  refreshToken: string;
}
