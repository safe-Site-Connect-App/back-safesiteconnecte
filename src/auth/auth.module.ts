import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { ResetToken, ResetTokenSchema } from './schemas/reset-token.schema';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport'; // AJOUT CRITIQUE
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from 'src/services/mail.service';
import { JwtStrategy } from 'src/guards/jwt.strategy'; // AJOUT CRITIQUE

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // AJOUT CRITIQUE
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: ResetToken.name, schema: ResetTokenSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret') || process.env.JWT_SECRET,
        signOptions: { expiresIn: '10h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    MailService,
    JwtStrategy, // AJOUT CRITIQUE - La stratégie doit être dans les providers
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}