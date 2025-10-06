import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request } from 'express';

// تعريف واجهة Request مع userId
export interface RequestWithUserId extends Request {
  userId?: string;
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUserId>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      // التحقق من الـ JWT
      const payload = this.jwtService.verify(token);

      // حفظ userId في request لتستعمله في Controller
      request.userId = payload.userId;

      // ممكن تحفظ باقي البيانات إذا حبيت، مثلاً role أو email
      // request.role = payload.role;

      return true;
    } catch (e) {
      Logger.error('JWT verification failed: ' + e.message);
      throw new UnauthorizedException('Invalid Token');
    }
  }

  private extractTokenFromHeader(request: RequestWithUserId): string | undefined {
    // التحقق من Authorization header: "Bearer <token>"
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return undefined;

    return parts[1];
  }
}
