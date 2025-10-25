import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Request,
  ForbiddenException 
} from '@nestjs/common';
import { TachesService } from './taches.service';
import { CreateTacheDto } from './dto/create-tach.dto';
import { UpdateTacheDto } from './dto/update-tach.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.gard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

/**
 * Controller for handling task-related HTTP requests.
 */
@Controller('taches')
@UseGuards(JwtAuthGuard) // Requires JWT authentication for all routes
export class TachesController {
  constructor(private readonly tachesService: TachesService) {}

  /**
   * Creates a new task (admin only).
   * @param createTacheDto - Data for creating a task.
   * @param req - Request object containing authenticated user info.
   * @returns The created task.
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() createTacheDto: CreateTacheDto, @Request() req) {
    console.log('Creating task with user:', req.user);
    return this.tachesService.create(createTacheDto);
  }

  /**
   * Retrieves all tasks.
   * @param req - Request object containing authenticated user info.
   * @returns List of all tasks.
   */
  @Get()
  findAll(@Request() req) {
    console.log('Fetching all tasks, user:', req.user);
    return this.tachesService.findAll();
  }

  /**
   * Retrieves tasks assigned to the authenticated user.
   * @param req - Request object containing authenticated user info.
   * @returns List of tasks assigned to the user.
   */
  @Get('my-tasks')
  findMyTasks(@Request() req) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in JWT token');
    }
    console.log('Fetching tasks for user:', req.user);
    return this.tachesService.findByUser(userId);
  }

  /**
   * Retrieves a task by its ID.
   * @param id - Task ID.
   * @returns The task with the specified ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tachesService.findOne(id);
  }

 /* ---------- UPDATE (ADMIN + EMPLOYEE) ---------- */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTacheDto: UpdateTacheDto,
    @Request() req,
  ) {
    const user = req.user;
    console.log('Updating task, user:', user);

    // 1. Récupérer la tâche (assigneA typé UserDocument)
    const task = await this.tachesService.findOne(id);

    // 2. Vérifier les droits
    const isAdmin = user.role === 'Admin';                     // <-- rôle réel
    const isOwner = task.assigneA._id.toString() === user.userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'Accès refusé. Vous ne pouvez modifier que vos propres tâches ou être Admin.'
      );
    }

    // 3. Restreindre les champs pour les employés
    let payload: UpdateTacheDto = updateTacheDto;
    if (!isAdmin) {
      const forbidden = Object.keys(updateTacheDto).filter(k => k !== 'statut');
      if (forbidden.length) {
        throw new ForbiddenException(
          'Les employés ne peuvent modifier que le statut de la tâche.'
        );
      }
      payload = { statut: updateTacheDto.statut };
    }

    // 4. Mettre à jour
    return this.tachesService.update(id, payload);
  }

  /**
   * Deletes a task (admin only).
   * @param id - Task ID.
   * @param req - Request object containing authenticated user info.
   * @returns Success message.
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string, @Request() req) {
    console.log('Deleting task, user:', req.user);
    return this.tachesService.remove(id);
  }

  /**
   * Debug endpoint to log user information from JWT.
   * @param req - Request object containing authenticated user info.
   * @returns Debug information about the user.
   */
  @Get('debug/user')
  debugUser(@Request() req) {
    console.log('=== DEBUG USER INFO ===');
    console.log('Full request.user:', JSON.stringify(req.user, null, 2));
    console.log('Type of request.user:', typeof req.user);
    console.log('Keys in request.user:', Object.keys(req.user || {}));
    console.log('Has role property?', 'role' in (req.user || {}));
    console.log('Role value:', req.user?.role);
    console.log('Role type:', typeof req.user?.role);
    console.log('======================');
    
    return {
      message: 'Debug info logged in console',
      user: req.user,
      userKeys: Object.keys(req.user || {}),
      hasRole: 'role' in (req.user || {}),
      roleValue: req.user?.role,
    };
  }
}