import { Test, TestingModule } from '@nestjs/testing';
import { AcceuilService } from './acceuil.service';

describe('AcceuilService', () => {
  let service: AcceuilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcceuilService],
    }).compile();

    service = module.get<AcceuilService>(AcceuilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
