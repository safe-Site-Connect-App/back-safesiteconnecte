import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AcceuilService } from './acceuil.service';
import { CreateAcceuilDto } from './dto/create-acceuil.dto';
import { UpdateAcceuilDto } from './dto/update-acceuil.dto';

@Controller('acceuil')
export class AcceuilController {
  constructor(private readonly acceuilService: AcceuilService) {}

  @Post()
  create(@Body() createAcceuilDto: CreateAcceuilDto) {
    return this.acceuilService.create(createAcceuilDto);
  }

  @Get()
  findAll() {
    return this.acceuilService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.acceuilService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAcceuilDto: UpdateAcceuilDto) {
    return this.acceuilService.update(+id, updateAcceuilDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.acceuilService.remove(+id);
  }
}
