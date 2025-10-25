import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Type correct pour un document Mongoose hydraté
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
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

  @Prop({ required: false })
  googleId?: string;

  @Prop({ required: false })
  profilePicture?: string;

  @Prop({ default: false })
  otpVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Export correct du type hydraté
export type UserDocument = HydratedDocument<User>;