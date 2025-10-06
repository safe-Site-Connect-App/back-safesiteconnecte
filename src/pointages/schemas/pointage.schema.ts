import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../auth/schemas/user.schema';

export type PointageDocument = Pointage & Document;

@Schema({ timestamps: true })
export class Pointage {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  // Nom de l'utilisateur pour faciliter les requêtes
  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ required: true })
  heure: string;

  @Prop({ required: true, enum: ['ENTREE', 'SORTIE'] })
  type: 'ENTREE' | 'SORTIE';

  @Prop({ required: true, enum: ['Present', 'Absent'], default: 'Present' })
  etat: 'Present' | 'Absent';
}

export const PointageSchema = SchemaFactory.createForClass(Pointage);

// Créer un index composé pour éviter les doublons
PointageSchema.index({ user: 1, date: 1, type: 1 }, { unique: true });

// Index pour rechercher par email
PointageSchema.index({ userEmail: 1 });

// Index pour rechercher par nom
PointageSchema.index({ userName: 1 });