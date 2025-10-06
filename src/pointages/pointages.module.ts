import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PointagesController } from './pointages.controller';
import { PointagesService } from './pointages.service';
import { Pointage, PointageSchema } from './schemas/pointage.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pointage.name, schema: PointageSchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '10h' },
    }),
  ],
  controllers: [PointagesController],
  providers: [PointagesService],
})
export class PointagesModule {}