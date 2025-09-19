import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TachesService } from './taches.service';
import { CreateTacheDto } from 'src/taches/dto/create-tach.dto';
import { UpdateTacheDto } from 'src/taches/dto/update-tach.dto';

@Controller('taches')
export class TachesController {
  constructor(private readonly tachesService: TachesService) {}

  @Post()
  create(@Body() createTacheDto: CreateTacheDto) {
    return this.tachesService.create(createTacheDto);
  }

  @Get()
  findAll() {
    return this.tachesService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.tachesService.findByUser(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTacheDto: UpdateTacheDto) {
    return this.tachesService.update(id, updateTacheDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tachesService.remove(id);
  }
}
