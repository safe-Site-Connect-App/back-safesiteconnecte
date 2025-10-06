import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard: canActivate called');
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context) {
    console.log('JwtAuthGuard: handleRequest called');
    console.log('Error:', err);
    console.log('User from JWT Strategy:', user);
    console.log('Info:', info);
    
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }
    
    // Vérifier que le user contient bien le role
    if (!user.role) {
      console.error('CRITICAL: User object missing role!');
      console.error('User object:', JSON.stringify(user, null, 2));
    }
    
    return user;
  }
}