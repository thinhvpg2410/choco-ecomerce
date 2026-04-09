import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { UserAddressesService } from './user-addresses.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';

@Controller('user-addresses')
export class UserAddressesController {
  constructor(private readonly userAddressesService: UserAddressesService) {}

  @Post()
  create(@Body() createUserAddressDto: CreateUserAddressDto, @Request() req) {
    createUserAddressDto.userId = req.user.id;
    return this.userAddressesService.create(createUserAddressDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.userAddressesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userAddressesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserAddressDto: UpdateUserAddressDto) {
    return this.userAddressesService.update(id, updateUserAddressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userAddressesService.remove(id);
  }
}