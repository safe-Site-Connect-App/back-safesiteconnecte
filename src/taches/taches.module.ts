import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TachesService } from './taches.service';
import { TachesController } from './taches.controller';
import { Tache, TacheSchema } from 'src/taches/schemas/tach.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Tache.name, schema: TacheSchema }])],
  controllers: [TachesController],
  providers: [TachesService],
  exports: [TachesService],
})
export class TachesModule {}
