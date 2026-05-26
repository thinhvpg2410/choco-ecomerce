import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductImagesService } from './product-images.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('ProductImages')
@Controller('product-images')
export class ProductImagesController {
  constructor(private readonly service: ProductImagesService) {}

  @ApiQuery({ name: 'product_id', required: false })
  @Get()
  async findAll(@Query('product_id') productId?: string) {
    return this.service.findAll(productId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @ApiBody({ type: CreateProductImageDto })
  async create(@Body() dto: CreateProductImageDto) {
    return this.service.create(dto);
  }

  @Post('upload')
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'productId'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        productId: {
          type: 'string',
          format: 'uuid',
        },
        sortOrder: {
          type: 'integer',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { productId: string; sortOrder?: string },
  ) {
    const sortOrder = body.sortOrder ? parseInt(body.sortOrder, 10) : undefined;
    return this.service.uploadAndCreate(file, body.productId, sortOrder);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  @ApiBody({ type: UpdateProductImageDto })
  async update(@Param('id') id: string, @Body() dto: UpdateProductImageDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.admin)
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
