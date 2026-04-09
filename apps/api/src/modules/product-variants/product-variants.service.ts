import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@Injectable()
export class ProductVariantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductVariantDto) {
    return this.prisma.productVariant.create({ data: dto });
  }

  async findAll(productId?: string) {
    return this.prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id } });
    if (!variant) throw new NotFoundException('Product variant not found');
    return variant;
  }

  async update(id: string, dto: UpdateProductVariantDto) {
    return this.prisma.productVariant.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.prisma.productVariant.delete({ where: { id } });
    return { success: true, message: 'Product variant deleted successfully' };
  }
}
