import { Module } from '@nestjs/common';
import { ProductImagesService } from './product-images.service';
import { ProductImagesController } from './product-images.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UploadModule } from '../../common/upload/upload.module';

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [ProductImagesController],
  providers: [ProductImagesService],
  exports: [ProductImagesService],
})
export class ProductImagesModule {}
