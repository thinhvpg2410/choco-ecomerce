// src/modules/banners/banners.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { UploadService } from '../../common/upload/upload.service';

@Injectable()
export class BannersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async create(dto: CreateBannerDto) {
    return this.prisma.banner.create({ data: dto });
  }

  async findAll(isActiveOnly: boolean = false) {
    return this.prisma.banner.findMany({
      where: isActiveOnly ? { isActive: true } : {},
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        description: true,
        imageUrl: true, 
        productId: true, 
        isActive: true, 
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findActiveBanners() {
    return this.findAll(true);
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

  async uploadImage(id: string, file: Express.Multer.File) {
    const imageUrl = await this.uploadService.uploadImage(file, 'banners');
    return this.prisma.banner.update({
      where: { id },
      data: { imageUrl }, // ← sửa thành imageUrl
    });
  }

  async remove(id: string) {
    await this.prisma.banner.delete({ where: { id } });
    return { success: true, message: 'Banner deleted successfully' };
  }
}
