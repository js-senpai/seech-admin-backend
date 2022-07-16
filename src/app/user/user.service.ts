import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../common/schemas/users.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getUser(userId: number): Promise<{ user: User }> {
    try {
      return {
        user: await this.userModel.findOne({ userId }),
      };
    } catch (e) {
      throw new InternalServerErrorException(`Error in get user method.  ${e}`);
    }
  }
}
