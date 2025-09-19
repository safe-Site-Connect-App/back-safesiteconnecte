import { Injectable } from '@nestjs/common';
import { CreateAcceuilDto } from './dto/create-acceuil.dto';
import { UpdateAcceuilDto } from './dto/update-acceuil.dto';

@Injectable()
export class AcceuilService {
  create(createAcceuilDto: CreateAcceuilDto) {
    return 'This action adds a new acceuil';
  }

  findAll() {
    return `This action returns all acceuil`;
  }

  findOne(id: number) {
    return `This action returns a #${id} acceuil`;
  }

  update(id: number, updateAcceuilDto: UpdateAcceuilDto) {
    return `This action updates a #${id} acceuil`;
  }

  remove(id: number) {
    return `This action removes a #${id} acceuil`;
  }
}
