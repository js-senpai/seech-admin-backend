import { Test, TestingModule } from '@nestjs/testing';
import { MyRequestsController } from './my-requests.controller';

describe('MyRequestsController', () => {
  let controller: MyRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyRequestsController],
    }).compile();

    controller = module.get<MyRequestsController>(MyRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
