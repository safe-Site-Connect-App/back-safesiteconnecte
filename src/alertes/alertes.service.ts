import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alerte, AlerteDocument } from './schemas/alerte.schema';
import { CreateAlerteDto } from './dto/create-alerte.dto';
import { UpdateAlerteDto } from './dto/update-alerte.dto';

@Injectable()
export class AlerteService {
  constructor(
    @InjectModel(Alerte.name) private alerteModel: Model<AlerteDocument>,
  ) {}

  async create(createAlerteDto: CreateAlerteDto): Promise<Alerte> {
    const alerte = new this.alerteModel(createAlerteDto);
    return alerte.save();
  }

  async findAll(): Promise<Alerte[]> {
    return this.alerteModel.find().exec();
  }

  async findOne(id: string): Promise<Alerte> {
    const alerte = await this.alerteModel.findById(id).exec();
    if (!alerte) {
      throw new NotFoundException(`Alerte with ID "${id}" not found`);
    }
    return alerte;
  }

  async update(id: string, updateAlerteDto: UpdateAlerteDto): Promise<Alerte> {
    const alerte = await this.alerteModel
      .findByIdAndUpdate(id, updateAlerteDto, { new: true })
      .exec();
    if (!alerte) {
      throw new NotFoundException(`Alerte with ID "${id}" not found`);
    }
    return alerte;
  }

  async remove(id: string): Promise<void> {
    const result = await this.alerteModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Alerte with ID "${id}" not found`);
    }
  }
}
