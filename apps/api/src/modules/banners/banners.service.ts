import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async update(id: string, dto: UpdateBannerDto) {
    return this.prisma.banner.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.prisma.banner.delete({ where: { id } });
    return { success: true, message: 'Banner deleted successfully' };
  }
}
