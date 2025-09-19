import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePointageDto {
  @IsNotEmpty()
  user: string;

  @IsNotEmpty()
  @IsString()
  zone: string;
}
