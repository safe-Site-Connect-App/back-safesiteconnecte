import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';

@Module({
  imports: [ConfigModule], // Import ConfigModule pour accéder aux variables d'environnement
  providers: [MailService],
  exports: [MailService], // Exportez le service pour qu'il soit disponible dans d'autres modules
})
export class MailModule {}