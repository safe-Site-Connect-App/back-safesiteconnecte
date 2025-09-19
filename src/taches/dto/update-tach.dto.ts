import { PartialType } from '@nestjs/mapped-types';
import { CreateTacheDto } from 'src/taches/dto/create-tach.dto';

export class UpdateTacheDto extends PartialType(CreateTacheDto) {}
