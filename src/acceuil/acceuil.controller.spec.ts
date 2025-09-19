import { Test, TestingModule } from '@nestjs/testing';
import { AcceuilController } from './acceuil.controller';
import { AcceuilService } from './acceuil.service';

describe('AcceuilController', () => {
  let controller: AcceuilController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcceuilController],
      providers: [AcceuilService],
    }).compile();

    controller = module.get<AcceuilController>(AcceuilController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
