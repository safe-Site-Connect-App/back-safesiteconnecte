import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  nom: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  motdepasse: string;

  @Prop({ 
    required: true, 
    enum: ['Employee', 'Admin'], 
    default: 'Employee' 
  })
  role: string;

  @Prop({ 
    required: true, 
    enum: ['Technicien', 'Manager', 'Operator', 'Superviseur', 'Administrateur'] 
  })
  poste: string;

  @Prop({ 
    required: true, 
    enum: ['Technique', 'Management', 'Production', 'Qualité', 'Administration'] 
  })
  departement: string;

  // Optional fields for Google authentication
  @Prop({ required: false })
  googleId?: string;

  @Prop({ required: false })
  profilePicture?: string;

  // OTP verification status
  @Prop({ default: false })
  otpVerified: boolean;

  // Account status
  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);