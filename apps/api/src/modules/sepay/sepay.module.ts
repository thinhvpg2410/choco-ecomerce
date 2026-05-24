// sepay.module.ts
import { Module } from '@nestjs/common';
import { SepayController } from './sepay.controller';
import { SepayService } from './sepay.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [SepayController],
  providers: [SepayService, PrismaService],
  exports: [SepayService],
})
export class SepayModule {}
