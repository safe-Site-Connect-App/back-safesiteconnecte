import { PartialType } from '@nestjs/swagger';
import { CreateAcceuilDto } from './create-acceuil.dto';

export class UpdateAcceuilDto extends PartialType(CreateAcceuilDto) {}
