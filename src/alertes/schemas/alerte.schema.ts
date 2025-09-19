import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AlerteDocument = Alerte & Document;

@Schema({ timestamps: true })
export class Alerte {
  @Prop({ required: true })
  titre: string;

  @Prop({ required: true })
  description: string;

  @Prop({ 
    required: true, 
    enum: ['Critique', 'Modérée', 'Mineure'] 
  })
  priorite: string;

  @Prop()
  lieu: string;

  @Prop({ 
    required: true, 
    enum: ['New', 'In Progress', 'Resolved'], 
    default: 'New' 
  })
  statut: string;
}

export const AlerteSchema = SchemaFactory.createForClass(Alerte);
