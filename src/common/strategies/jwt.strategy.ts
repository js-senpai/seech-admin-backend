import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/users.schema';
import { Model } from 'mongoose';
import { AuthJwtPayload } from '../../app/auth/interface/auth-jwt.payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_KEY'),
    });
  }

  async validate(payload: AuthJwtPayload): Promise<User> {
    const { id } = payload;
    const user = await this.userModel.findOne({ userId: id });
    if (!user) {
      throw new UnauthorizedException('User not found!');
    }
    if(user.type !== 'admin' && user.type !== 'moderator'){
      throw new UnauthorizedException('User doesnt have access');
    }
    return user;
  }
}
