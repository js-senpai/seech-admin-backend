import { Test, TestingModule } from '@nestjs/testing';
import { TicketsSaleController } from './tickets-sale.controller';

describe('TicketsSaleController', () => {
  let controller: TicketsSaleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsSaleController],
    }).compile();

    controller = module.get<TicketsSaleController>(TicketsSaleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
