import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pointage, PointageDocument } from './schemas/pointage.schema';
import { CreatePointageDto } from './dto/create-pointage.dto';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class PointagesService {
  constructor(
    @InjectModel(Pointage.name) private readonly pointageModel: Model<PointageDocument>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Créer un pointage (ENTREE ou SORTIE)
   */
  async create(userId: string, createPointageDto: CreatePointageDto): Promise<PointageDocument> {
    console.log('📍 [CREATE POINTAGE] Début de la création');
    console.log('📍 UserID:', userId);
    console.log('📍 DTO:', createPointageDto);

    // Valider que l'utilisateur existe et récupérer ses informations
    const userExists = await this.userModel.findById(userId);
    if (!userExists) {
      console.error('❌ Utilisateur non trouvé:', userId);
      throw new NotFoundException('Utilisateur non trouvé');
    }
    console.log('✅ Utilisateur trouvé:', userExists.nom, userExists.email);

    // Parser la date depuis le DTO
    const pointageDate = new Date(createPointageDto.date);
    pointageDate.setHours(0, 0, 0, 0);
    console.log('📅 Date du pointage:', pointageDate);

    // Vérifier si un pointage du même type existe déjà aujourd'hui
    const existingPointage = await this.pointageModel.findOne({
      user: userId,
      date: pointageDate,
      type: createPointageDto.type,
    });

    if (existingPointage) {
      console.error('❌ Pointage déjà existant:', existingPointage);
      throw new BadRequestException(
        `Vous avez déjà enregistré une ${createPointageDto.type} aujourd'hui`
      );
    }

    // Déterminer l'état du pointage
    let etat: 'Present' | 'Absent' = 'Present';

    if (createPointageDto.type === 'ENTREE') {
      // Absent si arrivée après 10h00
      const [hour, minute] = createPointageDto.heure.split(':').map(Number);
      console.log('⏰ Heure d\'arrivée:', hour, ':', minute);
      
      if (hour > 10 || (hour === 10 && minute > 0)) {
        etat = 'Absent';
        console.log('⚠️ Retard détecté - État: Absent');
      } else {
        console.log('✅ À l\'heure - État: Present');
      }
    } else if (createPointageDto.type === 'SORTIE') {
      // Vérifier si l'utilisateur a fait une ENTREE aujourd'hui
      const entreeToday = await this.pointageModel.findOne({
        user: userId,
        date: pointageDate,
        type: 'ENTREE',
      });

      if (!entreeToday) {
        console.error('❌ Aucune ENTREE trouvée pour aujourd\'hui');
        throw new BadRequestException(
          'Vous devez enregistrer une ENTREE avant de pouvoir enregistrer une SORTIE'
        );
      }

      // Garder l'état de l'ENTREE pour la SORTIE
      etat = entreeToday.etat;
      console.log('🔄 État hérité de l\'ENTREE:', etat);
    }

    // Créer le nouveau pointage avec userName
    const newPointage = new this.pointageModel({
      user: userId,
      userName: userExists.nom,
      date: pointageDate,
      heure: createPointageDto.heure,
      type: createPointageDto.type,
      etat,
    });

    console.log('💾 Sauvegarde du pointage...', {
      userName: userExists.nom,
      type: createPointageDto.type,
      heure: createPointageDto.heure,
      etat,
    });

    const savedPointage = await newPointage.save();
    console.log('✅ Pointage créé avec succès:', savedPointage._id);

    return savedPointage;
  }

  /**
   * Récupérer les pointages d'un utilisateur pour une période
   */
  async findByUserAndWeek(
    userId: string, 
    start: Date, 
    end: Date
  ): Promise<PointageDocument[]> {
    const userExists = await this.userModel.findById(userId);
    if (!userExists) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return this.pointageModel
      .find({
        user: userId,
        date: { $gte: start, $lte: end },
      })
      .populate('user', 'nom email')
      .sort({ date: -1, type: 1 })
      .exec();
  }

  /**
   * Récupérer tous les pointages pour une période
   */
  async findAllByWeek(start: Date, end: Date): Promise<PointageDocument[]> {
    return this.pointageModel
      .find({
        date: { $gte: start, $lte: end },
      })
      .populate('user', 'nom email')
      .sort({ date: -1, user: 1, type: 1 })
      .exec();
  }

  /**
   * Générer un rapport de présence
   */
  async getAttendanceReport(start: Date, end: Date) {
    const allUsers = await this.userModel.find().select('nom email').exec();
    const pointages = await this.pointageModel
      .find({
        date: { $gte: start, $lte: end },
        type: 'ENTREE',
      })
      .exec();

    return allUsers.map(user => {
      const userPointages = pointages.filter(
        p => p.user.toString() === user._id.toString()
      );

      const joursPresent = userPointages.filter(p => p.etat === 'Present').length;
      const joursAbsent = userPointages.filter(p => p.etat === 'Absent').length;

      const totalJours = this.getWorkingDays(start, end);
      const joursNonPointes = totalJours - (joursPresent + joursAbsent);

      return {
        userId: user._id,
        username: user.nom,
        email: user.email,
        joursPresent,
        joursAbsent,
        joursNonPointes,
        totalJours,
        tauxPresence: totalJours > 0 
          ? ((joursPresent / totalJours) * 100).toFixed(2) + '%'
          : '0%',
      };
    });
  }

  /**
   * Calculer le nombre de jours ouvrables (lundi à vendredi)
   */
  private getWorkingDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  /**
   * Récupérer le pointage du jour pour un utilisateur
   */
  async getTodayPointage(userId: string): Promise<{
    hasEntree: boolean;
    hasSortie: boolean;
    entree?: PointageDocument;
    sortie?: PointageDocument;
  }> {
    console.log('📍 [GET TODAY] Récupération pour userId:', userId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log('📅 Date d\'aujourd\'hui:', today);

    const entree = await this.pointageModel.findOne({
      user: userId,
      date: today,
      type: 'ENTREE',
    });

    const sortie = await this.pointageModel.findOne({
      user: userId,
      date: today,
      type: 'SORTIE',
    });

    console.log('📊 Résultat:', {
      hasEntree: !!entree,
      hasSortie: !!sortie,
      entreeId: entree?._id,
      sortieId: sortie?._id,
    });

    return {
      hasEntree: !!entree,
      hasSortie: !!sortie,
      entree: entree || undefined,
      sortie: sortie || undefined,
    };
  }
}