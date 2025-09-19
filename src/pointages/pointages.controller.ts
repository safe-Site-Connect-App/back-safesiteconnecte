import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PointagesService } from './pointages.service';
import { CreatePointageDto } from './dto/create-pointage.dto';

@Controller('pointages')
export class PointagesController {
  constructor(private readonly pointagesService: PointagesService) {}

  // Ajouter pointage
  @Post()
  create(@Body() createPointageDto: CreatePointageDto) {
    return this.pointagesService.create(createPointageDto);
  }

  // GET /pointages/user/:id?start=YYYY-MM-DD&end=YYYY-MM-DD
  @Get('user/:id')
  findByUserAndWeek(
    @Param('id') id: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.pointagesService.findByUserAndWeek(id, new Date(start), new Date(end));
  }

  // GET /pointages/week?start=YYYY-MM-DD&end=YYYY-MM-DD
  @Get('week')
  findAllByWeek(@Query('start') start: string, @Query('end') end: string) {
    return this.pointagesService.findAllByWeek(new Date(start), new Date(end));
  }

  // GET /pointages/report?start=YYYY-MM-DD&end=YYYY-MM-DD
  @Get('report')
  getReport(@Query('start') start: string, @Query('end') end: string) {
    return this.pointagesService.getAttendanceReport(new Date(start), new Date(end));
  }
}
