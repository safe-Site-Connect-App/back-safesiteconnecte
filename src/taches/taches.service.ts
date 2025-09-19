import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tache } from 'src/taches/schemas/tach.schema';
import { CreateTacheDto } from 'src/taches/dto/create-tach.dto';
import { UpdateTacheDto } from 'src/taches/dto/update-tach.dto';

@Injectable()
export class TachesService {
  constructor(
    @InjectModel(Tache.name) private readonly tacheModel: Model<Tache>,
  ) {}

  async create(createTacheDto: CreateTacheDto): Promise<Tache> {
    const newTache = new this.tacheModel(createTacheDto);
    return newTache.save();
  }

  async findAll(): Promise<Tache[]> {
    return this.tacheModel.find().populate('assigneA', 'username email').exec();
  }

  async findByUser(userId: string): Promise<Tache[]> {
    return this.tacheModel.find({ assigneA: userId }).populate('assigneA', 'username email').exec();
  }

  async update(id: string, updateTacheDto: UpdateTacheDto): Promise<Tache> {
    const updated = await this.tacheModel.findByIdAndUpdate(id, updateTacheDto, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException(`Tache ${id} non trouvée`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.tacheModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Tache ${id} non trouvée`);
    }
  }
}
