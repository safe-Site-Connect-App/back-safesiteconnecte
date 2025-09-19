import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from 'src/auth/auth.service';
import { AuthController } from 'src/auth/auth.controller';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { RefreshToken, RefreshTokenSchema } from 'src/auth/schemas/refresh-token.schema';
import { ResetToken, ResetTokenSchema } from 'src/auth/schemas/reset-token.schema';
import { MailModule } from '../services/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: ResetToken.name, schema: ResetTokenSchema },
    ]),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
