import { Test, TestingModule } from '@nestjs/testing';
import { SelectedTicketsController } from './selected-tickets.controller';

describe('SelectedTicketsController', () => {
  let controller: SelectedTicketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SelectedTicketsController],
    }).compile();

    controller = module.get<SelectedTicketsController>(SelectedTicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
