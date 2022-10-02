import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileStorageService } from '../file-storage/file-storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';

@Controller('ticket-image')
@UseGuards(AuthGuard('jwt'))
export class TicketImageController {
  constructor(protected readonly fileStorageService: FileStorageService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        files: 1,
      },
    }),
  )
  async uploadMedia(@UploadedFile() file: Express.Multer.File) {
    return await this.fileStorageService.uploadFile(file);
  }
}
