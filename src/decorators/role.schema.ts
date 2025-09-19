import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface Permission {
  resource: string;
  actions: string[];
}

@Schema()
export class Role extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({
    type: [{ resource: String, actions: [String] }],
    default: [],
  })
  permissions: Permission[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
