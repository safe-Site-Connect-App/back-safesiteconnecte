
// ==================== update-alerte.dto.ts ====================
import { PartialType } from '@nestjs/mapped-types';
import { CreateAlerteDto } from './create-alerte.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateAlerteDto extends PartialType(CreateAlerteDto) {
  @IsEnum(['New', 'In Progress', 'Resolved'], {
    message: 'Le statut doit être New, In Progress ou Resolved',
  })
  @IsOptional()
  statut?: string;
}