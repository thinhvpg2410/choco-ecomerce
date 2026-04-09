import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOkResponse({ description: 'List banners' })
  async findAll() {
    return this.bannersService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Banner details' })
  async findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @ApiBody({ type: CreateBannerDto })
  async create(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @ApiBody({ type: UpdateBannerDto })
  async update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  async remove(@Param('id') id: string) {
    return this.bannersService.remove(id);
  }
}
