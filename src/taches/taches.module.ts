import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TachesService } from './taches.service';
import { TachesController } from './taches.controller';
import { Tache, TacheSchema } from 'src/taches/schemas/tach.schema';
// IMPORTANT: Importer le User schema pour la JwtStrategy
import { User, UserSchema } from 'src/auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tache.name, schema: TacheSchema },
      { name: User.name, schema: UserSchema }, // ✅ Ajout crucial !
    ]),
  ],
  controllers: [TachesController],
  providers: [TachesService],
  exports: [TachesService],
})
export class TachesModule {}