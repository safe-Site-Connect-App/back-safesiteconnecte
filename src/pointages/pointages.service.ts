import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pointage } from 'src/pointages/schemas/pointage.schema';
import { CreatePointageDto } from './dto/create-pointage.dto';
import { User } from 'src/auth/schemas/user.schema';

@Injectable()
export class PointagesService {
  constructor(
    @InjectModel(Pointage.name) private readonly pointageModel: Model<Pointage>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // Ajouter pointage (Présent par défaut)
  async create(createPointageDto: CreatePointageDto): Promise<Pointage> {
    const newPointage = new this.pointageModel({
      ...createPointageDto,
      date: new Date(),
      etat: 'Present',
    });
    return newPointage.save();
  }

  // Récupérer pointages d’un user pour une semaine
  async findByUserAndWeek(userId: string, start: Date, end: Date): Promise<Pointage[]> {
    return this.pointageModel.find({
      user: userId,
      date: { $gte: start, $lte: end },
    }).populate('user', 'username email').exec();
  }

  // Récupérer tous les pointages pour une semaine (all users)
  async findAllByWeek(start: Date, end: Date): Promise<Pointage[]> {
    return this.pointageModel.find({
      date: { $gte: start, $lte: end },
    }).populate('user', 'username email').exec();
  }

  // Rapport Présent/Absent pour chaque user
  async getAttendanceReport(start: Date, end: Date) {
    const allUsers = await this.userModel.find().exec();
    const pointages = await this.pointageModel.find({
      date: { $gte: start, $lte: end },
    }).exec();

    return allUsers.map(user => {
      const userPointages = pointages.filter(p => p.user.toString() === user._id.toString());
      return {
        user,
        joursPresent: userPointages.length,
        joursAbsent: Math.max(0, 7 - userPointages.length),
      };
    });
  }
}
