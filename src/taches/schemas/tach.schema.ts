import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema'; // تأكد من المسار الصحيح

@Schema({ timestamps: true })
export class Tache extends Document {
  @Prop({ required: true })
  titre: string;

  @Prop()
  description: string;

  @Prop({ enum: ['P1', 'P2', 'P3'], required: true })
  priorite: string;

  @Prop()
  zone: string;

  @Prop({ enum: ['New', 'In Progress', 'Completed'], default: 'New' })
  statut: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  assigneA: User;
}

export const TacheSchema = SchemaFactory.createForClass(Tache);
