import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../common/schemas/users.schema';
import { Model } from 'mongoose';
import { IResponseUser } from './user.interfaces';
import { UpdateUserDto } from './user.dto';
import { RoleDecorator } from '../../../common/decorators/role.decorator';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async getUser(userId: number): Promise<{ user: User }> {
    try {
      return {
        user: await this.userModel.findOne({ userId }),
      };
    } catch (e) {
      this.logger.error(`Error in get user method.  ${e}`);
      throw new InternalServerErrorException(`Error in get user method.  ${e}`);
    }
  }

  @RoleDecorator(['user'])
  async update({
    region,
    countryState,
    countryOtg,
    user,
  }: UpdateUserDto & {
    user: User;
  }): Promise<IResponseUser> {
    try {
      await this.userModel.updateOne(
        { userId: user.userId },
        { region, countryState, countryOtg },
      );
      return {
        ok: 'User has successfully updated',
      };
    } catch (e) {
      this.logger.error(`Error in update user method.  ${e}`);
      throw new InternalServerErrorException(
        `Error in update user method.  ${e}`,
      );
    }
  }
}
