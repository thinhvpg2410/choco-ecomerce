import {
  Controller,
  Get,
  Patch,
  Delete,
  Req,
  Body,
  Param,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: Request) {
    const { sub } = req.user as { sub: string };
    const user = await this.usersService.findById(sub);
    return {
      success: true,
      message: 'User profile fetched successfully',
      data: user,
    };
  }

  @Patch('me')
  async updateMe(@Req() req: Request, @Body() dto: UpdateUserDto) {
    const { sub } = req.user as { sub: string };
    const user = await this.usersService.updateUser(sub, dto);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: user,
    };
  }

  // ==================== CHỈ ADMIN MỚI ĐƯỢC XÓA USER ====================
  @Delete(':id')
  @ApiOperation({ summary: 'Admin xóa user (set status = inactive)' })
  async deleteUserByAdmin(@Param('id') id: string) {
    const user = await this.usersService.deleteUserByAdmin(id);

    return {
      success: true,
      message: 'User has been deactivated successfully',
      data: user,
    };
  }
}
