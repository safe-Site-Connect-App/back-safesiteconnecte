import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PointagesService } from './pointages.service';
import { PointagesController } from './pointages.controller';
import { Pointage, PointageSchema } from 'src/pointages/schemas/pointage.schema';
import { User, UserSchema } from 'src/auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pointage.name, schema: PointageSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [PointagesController],
  providers: [PointagesService],
})
export class PointagesModule {}
