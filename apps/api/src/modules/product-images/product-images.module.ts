import { Module } from '@nestjs/common';
import { ProductImagesService } from './product-images.service';
import { ProductImagesController } from './product-images.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductImagesController],
  providers: [ProductImagesService],
  exports: [ProductImagesService],
})
export class ProductImagesModule {}
