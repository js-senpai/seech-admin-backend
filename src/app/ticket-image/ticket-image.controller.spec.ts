import { Test, TestingModule } from '@nestjs/testing';
import { TicketImageController } from './ticket-image.controller';

describe('TicketImageController', () => {
  let controller: TicketImageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketImageController],
    }).compile();

    controller = module.get<TicketImageController>(TicketImageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
