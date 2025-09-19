import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/auth/auth.service';
import { PERMISSIONS_KEY } from 'src/decorators/permissions.decorator';
import { Permission } from 'src/decorators/role.schema';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector, private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.userId) {
      throw new UnauthorizedException('User Id not found');
    }

    const routePermissions: Permission[] = this.reflector.getAllAndOverride(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!routePermissions || routePermissions.length === 0) {
      return true; // Pas de permissions requises
    }

    const userPermissions: Permission[] = await this.authService.getUserPermissions(request.userId);

    for (const routePermission of routePermissions) {
      const userPermission = userPermissions.find(
        (perm) => perm.resource === routePermission.resource,
      );

      if (!userPermission) {
        throw new ForbiddenException(`User lacks permission for resource: ${routePermission.resource}`);
      }

      const allActionsAvailable = routePermission.actions.every(
        (action) => userPermission.actions.includes(action),
      );

      if (!allActionsAvailable) {
        throw new ForbiddenException(`User lacks required actions for resource: ${routePermission.resource}`);
      }
    }

    return true;
  }
}
