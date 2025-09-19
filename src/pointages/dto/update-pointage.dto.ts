import { PartialType } from '@nestjs/mapped-types';
import { CreatePointageDto } from './create-pointage.dto';

export class UpdatePointageDto extends PartialType(CreatePointageDto) {}
