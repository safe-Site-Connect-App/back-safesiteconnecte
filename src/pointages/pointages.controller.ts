import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { PointagesService } from './pointages.service';
import { CreatePointageDto } from './dto/create-pointage.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.gard';

@Controller('pointages')
@UseGuards(JwtAuthGuard)
export class PointagesController {
  constructor(private readonly pointagesService: PointagesService) {}

  /**
   * POST /pointages/create
   * Créer un nouveau pointage (ENTREE ou SORTIE)
   */
  @Post('create')
  async create(@Request() req, @Body() createPointageDto: CreatePointageDto) {
    console.log('========================================');
    console.log('📍 [CONTROLLER] POST /pointages/create');
    console.log('📍 Request User:', req.user);
    console.log('📍 User ID:', req.user?.userId);
    console.log('📍 Body reçu:', createPointageDto);
    console.log('========================================');

    if (!req.user?.userId) {
      console.error('❌ User ID manquant dans la requête');
      throw new HttpException(
        'Utilisateur non authentifié',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const pointage = await this.pointagesService.create(
        req.user.userId,
        createPointageDto,
      );

      console.log('✅ [CONTROLLER] Pointage créé avec succès:', pointage._id);
      
      return {
        success: true,
        message: 'Pointage enregistré avec succès',
        data: {
          id: pointage._id,
          type: pointage.type,
          date: pointage.date,
          heure: pointage.heure,
          etat: pointage.etat,
          userName: pointage.userName,
        },
      };
    } catch (error) {
      console.error('❌ [CONTROLLER] Erreur lors de la création:', error.message);
      console.error('Stack:', error.stack);
      
      // Gérer les erreurs spécifiques
      if (error.status) {
        throw error;
      }
      
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Erreur lors de la création du pointage',
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /pointages/today
   * Récupérer le pointage du jour de l'utilisateur connecté
   */
  @Get('today')
  async getTodayPointage(@Request() req) {
    console.log('========================================');
    console.log('📍 [CONTROLLER] GET /pointages/today');
    console.log('📍 User ID:', req.user?.userId);
    console.log('========================================');

    if (!req.user?.userId) {
      throw new HttpException(
        'Utilisateur non authentifié',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const todayPointage = await this.pointagesService.getTodayPointage(
        req.user.userId,
      );

      console.log('✅ [CONTROLLER] Pointage du jour récupéré:', {
        hasEntree: todayPointage.hasEntree,
        hasSortie: todayPointage.hasSortie,
      });

      return {
        success: true,
        data: todayPointage,
      };
    } catch (error) {
      console.error('❌ [CONTROLLER] Erreur:', error.message);
      throw new HttpException(
        error.message || 'Erreur lors de la récupération du pointage',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /pointages/user/:userId
   * Récupérer les pointages d'un utilisateur pour une période
   */
  @Get('user/:userId')
  async getUserPointages(
    @Param('userId') userId: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Request() req,
  ) {
    console.log('========================================');
    console.log('📍 [CONTROLLER] GET /pointages/user/:userId');
    console.log('📍 Target UserID:', userId);
    console.log('📍 Requesting User:', req.user?.userId);
    console.log('📍 Period:', start, 'to', end);
    console.log('========================================');

    if (!start || !end) {
      throw new HttpException(
        'Les paramètres start et end sont requis',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new HttpException(
          'Format de date invalide',
          HttpStatus.BAD_REQUEST,
        );
      }

      const pointages = await this.pointagesService.findByUserAndWeek(
        userId,
        startDate,
        endDate,
      );

      console.log(`✅ [CONTROLLER] ${pointages.length} pointages trouvés`);

      return {
        success: true,
        count: pointages.length,
        data: pointages,
      };
    } catch (error) {
      console.error('❌ [CONTROLLER] Erreur:', error.message);
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des pointages',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /pointages/week
   * Récupérer tous les pointages pour une semaine (admin uniquement)
   */
  @Get('week')
  async getWeekPointages(
    @Query('start') start: string,
    @Query('end') end: string,
    @Request() req,
  ) {
    console.log('========================================');
    console.log('📍 [CONTROLLER] GET /pointages/week');
    console.log('📍 Requesting User:', req.user?.userId);
    console.log('📍 Period:', start, 'to', end);
    console.log('========================================');

    if (!start || !end) {
      throw new HttpException(
        'Les paramètres start et end sont requis',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new HttpException(
          'Format de date invalide',
          HttpStatus.BAD_REQUEST,
        );
      }

      const pointages = await this.pointagesService.findAllByWeek(
        startDate,
        endDate,
      );

      console.log(`✅ [CONTROLLER] ${pointages.length} pointages trouvés`);

      return {
        success: true,
        count: pointages.length,
        data: pointages,
      };
    } catch (error) {
      console.error('❌ [CONTROLLER] Erreur:', error.message);
      throw new HttpException(
        error.message || 'Erreur lors de la récupération des pointages',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /pointages/report
   * Générer un rapport de présence pour une période
   */
  @Get('report')
  async getAttendanceReport(
    @Query('start') start: string,
    @Query('end') end: string,
    @Request() req,
  ) {
    console.log('========================================');
    console.log('📍 [CONTROLLER] GET /pointages/report');
    console.log('📍 Requesting User:', req.user?.userId);
    console.log('📍 Period:', start, 'to', end);
    console.log('========================================');

    if (!start || !end) {
      throw new HttpException(
        'Les paramètres start et end sont requis',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new HttpException(
          'Format de date invalide',
          HttpStatus.BAD_REQUEST,
        );
      }

      const report = await this.pointagesService.getAttendanceReport(
        startDate,
        endDate,
      );

      console.log(`✅ [CONTROLLER] Rapport généré pour ${report.length} utilisateurs`);

      return {
        success: true,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        data: report,
      };
    } catch (error) {
      console.error('❌ [CONTROLLER] Erreur:', error.message);
      throw new HttpException(
        error.message || 'Erreur lors de la génération du rapport',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /pointages/my-history
   * Récupérer l'historique des pointages de l'utilisateur connecté
   */
  @Get('my-history')
  async getMyHistory(
    @Query('start') start: string,
    @Query('end') end: string,
    @Request() req,
  ) {
    console.log('========================================');
    console.log('📍 [CONTROLLER] GET /pointages/my-history');
    console.log('📍 User ID:', req.user?.userId);
    console.log('📍 Period:', start, 'to', end);
    console.log('========================================');

    if (!req.user?.userId) {
      throw new HttpException(
        'Utilisateur non authentifié',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!start || !end) {
      throw new HttpException(
        'Les paramètres start et end sont requis',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new HttpException(
          'Format de date invalide',
          HttpStatus.BAD_REQUEST,
        );
      }

      const pointages = await this.pointagesService.findByUserAndWeek(
        req.user.userId,
        startDate,
        endDate,
      );

      console.log(`✅ [CONTROLLER] ${pointages.length} pointages trouvés`);

      return {
        success: true,
        count: pointages.length,
        data: pointages,
      };
    } catch (error) {
      console.error('❌ [CONTROLLER] Erreur:', error.message);
      throw new HttpException(
        error.message || 'Erreur lors de la récupération de l\'historique',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}