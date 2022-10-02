import { Module } from '@nestjs/common';
import { TicketImageService } from './ticket-image.service';
import { TicketImageController } from './ticket-image.controller';
import { FileStorageService } from '../file-storage/file-storage.service';

@Module({
  providers: [FileStorageService, TicketImageService],
  controllers: [TicketImageController],
})
export class TicketImageModule {}
