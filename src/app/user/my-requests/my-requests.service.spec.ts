import { Test, TestingModule } from '@nestjs/testing';
import { MyRequestsService } from './my-requests.service';

describe('MyRequestsService', () => {
  let service: MyRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyRequestsService],
    }).compile();

    service = module.get<MyRequestsService>(MyRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
