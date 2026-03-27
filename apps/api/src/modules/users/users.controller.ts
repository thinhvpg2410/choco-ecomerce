import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'User profile' })
  @Get('me')
  async getMe(@Req() request: Request) {
    const currentUser = request.user as { sub: string };
    const user = await this.usersService.findById(currentUser.sub);
    return {
      success: true,
      message: 'User profile fetched successfully',
      data: user,
    };
  }
}
