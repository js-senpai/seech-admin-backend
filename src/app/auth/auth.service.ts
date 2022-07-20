import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../common/schemas/users.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import { checkTgAuth } from '../../common/utils/check-tg-auth.utils';
import { AuthJwtPayload } from './interface/auth-jwt.payload';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(data: AuthDto): Promise<{ token: string }> {
    const user = await this.userModel.findOne({ userId: data.id });
    if (!user) {
      throw new UnauthorizedException('User not found!');
    }

    if (user?.type === 'user') {
      throw new UnauthorizedException('User doesnt have access!');
    }
    const authTg = await checkTgAuth({
      ...data,
      token: this.configService.get('TELEGRAM_TOKEN'),
    });
    if (!authTg) {
      throw new UnauthorizedException('Incorrect login to telegram bot!');
    }
    const payload: AuthJwtPayload = { id: user.userId };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
