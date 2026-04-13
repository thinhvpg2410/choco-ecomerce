// user-addresses.controller.ts — fix req.user.sub
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserAddressesService } from './user-addresses.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('User Addresses')
@ApiBearerAuth()
@Controller('user-addresses')
export class UserAddressesController {
  constructor(private readonly userAddressesService: UserAddressesService) {}

  @Post()
  create(@Body() dto: CreateUserAddressDto, @Req() req: Request) {
    const { sub } = req.user as { sub: string };
    dto.userId = sub;
    return this.userAddressesService.create(dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const { sub } = req.user as { sub: string };
    return this.userAddressesService.findAll(sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userAddressesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserAddressDto) {
    return this.userAddressesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userAddressesService.remove(id);
  }
}
