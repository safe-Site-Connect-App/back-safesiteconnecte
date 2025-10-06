import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get('jwt.secret') || process.env.JWT_SECRET;
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
    
    console.log('JwtStrategy initialized with secret:', !!jwtSecret);
  }

  async validate(payload: any) {
    console.log('🔐 JWT Payload received in validate():', payload);

    // Validation basique
    if (!payload.sub && !payload.userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // ✅ Retourner TOUTES les données du payload
    const user = {
      userId: payload.sub || payload.userId,
      email: payload.email,
      nom: payload.nom,
      role: payload.role, // ✅ CRUCIAL: Le rôle du JWT
      poste: payload.poste,
      departement: payload.departement,
    };

    console.log('✅ Returning user object:', user);
    console.log('✅ Role value:', user.role);
    console.log('✅ Role type:', typeof user.role);

    // Vérification critique
    if (!user.role) {
      console.error('❌ CRITICAL ERROR: Role is missing!');
      console.error('Full payload was:', JSON.stringify(payload, null, 2));
      throw new UnauthorizedException('Invalid token: role missing');
    }

    return user; // ⚠️ Cet objet devient request.user
  }
}