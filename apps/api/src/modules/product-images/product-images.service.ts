import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

@Injectable()
export class ProductImagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductImageDto) {
    return this.prisma.productImage.create({ data: dto });
  }

  async findAll(productId?: string) {
    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const image = await this.prisma.productImage.findUnique({ where: { id } });
    if (!image) throw new NotFoundException('Product image not found');
    return image;
  }

  async update(id: string, dto: UpdateProductImageDto) {
    return this.prisma.productImage.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.prisma.productImage.delete({ where: { id } });
    return { success: true, message: 'Product image deleted successfully' };
  }
}
