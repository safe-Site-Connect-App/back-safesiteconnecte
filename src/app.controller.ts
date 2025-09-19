import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticationGuard } from './guards/authentication.guard';
import { Permissions } from './decorators/permissions.decorator';
import { Resource } from 'src/decorators/resource.enum';
import { Action } from 'src/decorators/action.enum';
import { AuthorizationGuard } from './guards/authorization.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('App') // Nom de la section dans Swagger
@ApiBearerAuth() // Indique que cette route nécessite un Bearer token
@UseGuards(AuthenticationGuard, AuthorizationGuard)
@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Permissions([{ resource: Resource.settings, actions: [Action.read] }])
  @Get()
  @ApiOperation({
    summary: 'Accéder à une ressource protégée',
    description: 'Cette route est protégée par des gardes d\'authentification et d\'autorisation.',
  })
  @ApiResponse({ status: 200, description: 'Accès réussi à la ressource.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  someProtectedRoute(@Req() req) {
    return { message: 'Accessed Resource', userId: req.userId };
  }
}
