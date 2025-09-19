import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PointagesModule } from './pointages/pointages.module';
import { AlerteModule } from 'src/alertes/alertes.module';
import { AcceuilModule } from './acceuil/acceuil.module';
import { TachesModule } from './taches/taches.module';

import config from './config/config';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),

    // JWT (Auth)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),

    // Connexion à MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: config.get('database.connectionString'),
      }),
      inject: [ConfigService],
    }),

    // Modules fonctionnels
    AuthModule,
    PointagesModule,
    AlerteModule,
    AcceuilModule,
    TachesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
