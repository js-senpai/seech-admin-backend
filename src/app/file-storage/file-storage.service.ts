import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class FileStorageService {
  bucketName = 'seech-bot';
  storage = null;
  constructor() {
    const getCredentials = join(
      __dirname,
      '..',
      '..',
      '..',
      'filestorage-config.json',
    );
    const storage = new Storage({ keyFilename: getCredentials });
    this.storage = storage.bucket(this.bucketName);
  }

  async uploadFile(file) {
    try {
      const fileName = file.originalname.toLowerCase();
      const uploadFile = this.storage.file(fileName);
      const stream = uploadFile.createWriteStream();
      stream.end(file.buffer);
      await this.storage.makePublic();
      return {
        url: `https://storage.googleapis.com/${this.bucketName}/${fileName}`,
      };
    } catch (e) {
      console.error(e);
    }
  }
}
