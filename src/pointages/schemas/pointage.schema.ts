import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';

@Schema({ timestamps: true })
export class Pointage extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true })
  zone: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ enum: ['Present', 'Absent'], default: 'Present' })
  etat: string; // présent par défaut
}

export const PointageSchema = SchemaFactory.createForClass(Pointage);
