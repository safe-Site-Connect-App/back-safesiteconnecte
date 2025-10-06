import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('User from request:', user); // Debug log
    console.log('Required roles:', requiredRoles); // Debug log

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // IMPORTANT: Votre schéma User utilise 'role' (singulier), pas 'roles' (pluriel)
    if (!user.role) {
      throw new ForbiddenException('User role not found');
    }

    // Vérifier si le rôle de l'utilisateur correspond aux rôles requis
    const hasRole = requiredRoles.some((role) => 
      user.role.toLowerCase() === role.toLowerCase()
    );

    if (!hasRole) {
      throw new ForbiddenException(`Access denied. Required role: ${requiredRoles.join(' or ')}`);
    }

    return true;
  }
}