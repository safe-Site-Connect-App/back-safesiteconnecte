import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlerteService } from 'src/alertes/alertes.service';
import { AlerteController } from 'src/alertes/alertes.controller';
import { Alerte, AlerteSchema } from './schemas/alerte.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Alerte.name, schema: AlerteSchema }])],
  controllers: [AlerteController],
  providers: [AlerteService],
})
export class AlerteModule {}
