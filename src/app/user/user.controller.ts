import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../common/schemas/users.schema';

@Controller('user')
@UseGuards(AuthGuard())
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async get(@Req() req: any): Promise<{ user: User }> {
    return await this.userService.getUser(req.user.userId);
  }
}
