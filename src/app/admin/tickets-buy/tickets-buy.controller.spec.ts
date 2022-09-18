import { Test, TestingModule } from '@nestjs/testing';
import { TicketsBuyController } from './tickets-buy.controller';

describe('TicketsBuyController', () => {
  let controller: TicketsBuyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsBuyController],
    }).compile();

    controller = module.get<TicketsBuyController>(TicketsBuyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
