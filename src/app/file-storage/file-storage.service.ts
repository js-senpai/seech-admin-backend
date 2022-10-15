import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { Storage } from '@google-cloud/storage';
import * as sharp from 'sharp';
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
      const fileName = file.originalname;
      const uploadFile = this.storage.file(fileName);
      const buffer = await sharp(file.buffer)
        .jpeg({ progressive: true, force: false, quality: 75 })
        .png({ progressive: true, force: false, quality: 75 })
        .toBuffer();
      const stream = uploadFile.createWriteStream();
      await stream.end(buffer);
      await this.storage.makePublic();
      return {
        url: `https://storage.googleapis.com/${this.bucketName}/${fileName}`,
      };
    } catch (e) {
      console.error(e);
    }
  }
}
