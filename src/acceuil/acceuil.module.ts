import { Module } from '@nestjs/common';
import { AcceuilService } from './acceuil.service';
import { AcceuilController } from './acceuil.controller';

@Module({
  controllers: [AcceuilController],
  providers: [AcceuilService]
})
export class AcceuilModule {}
