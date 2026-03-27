import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(query: QueryProductDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const search = query.search;
    const categoryId = query.category_id;
    const skip = (page - 1) * limit;

    const filters: Record<string, unknown> = { is_active: true };
    if (search) {
      filters.name = { $regex: search, $options: 'i' };
    }
    if (categoryId) {
      filters.category_id = new Types.ObjectId(categoryId);
    }

    const [products, total] = await Promise.all([
      this.productModel
        .find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('category_id', 'name')
        .exec(),
      this.productModel.countDocuments(filters),
    ]);

    return {
      success: true,
      message: 'Products fetched successfully',
      data: {
        items: products.map((product) => this.toProductResponse(product)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(productId: string) {
    this.validateObjectId(productId);
    const product = await this.productModel
      .findOne({ _id: productId, is_active: true })
      .populate('category_id', 'name')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      success: true,
      message: 'Product fetched successfully',
      data: this.toProductResponse(product),
    };
  }

  async create(createProductDto: CreateProductDto) {
    await this.ensureCategoryExists(createProductDto.category_id);
    const createdProduct = await this.productModel.create({
      ...createProductDto,
      category_id: new Types.ObjectId(createProductDto.category_id),
      is_active: createProductDto.is_active ?? true,
    });
    return {
      success: true,
      message: 'Product created successfully',
      data: this.toProductResponse(createdProduct),
    };
  }

  async update(productId: string, updateProductDto: UpdateProductDto) {
    this.validateObjectId(productId);
    if (updateProductDto.category_id) {
      await this.ensureCategoryExists(updateProductDto.category_id);
    }

    const payload = {
      ...updateProductDto,
      ...(updateProductDto.category_id
        ? { category_id: new Types.ObjectId(updateProductDto.category_id) }
        : {}),
    };

    const updatedProduct = await this.productModel
      .findOneAndUpdate({ _id: productId, is_active: true }, payload, {
        returnDocument: 'after',
      })
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return {
      success: true,
      message: 'Product updated successfully',
      data: this.toProductResponse(updatedProduct),
    };
  }

  async remove(productId: string) {
    this.validateObjectId(productId);
    const deletedProduct = await this.productModel
      .findOneAndUpdate(
        { _id: productId, is_active: true },
        { is_active: false },
        { returnDocument: 'after' },
      )
      .exec();

    if (!deletedProduct) {
      throw new NotFoundException('Product not found');
    }

    return { success: true, message: 'Product deleted successfully' };
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Product not found');
    }
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new NotFoundException('Category not found');
    }

    const category = await this.categoryModel.findById(categoryId).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }

  private toProductResponse(product: ProductDocument) {
    const categoryReference = product.category_id as
      | Types.ObjectId
      | { _id: Types.ObjectId; name?: string };

    return {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      images: product.images,
      category_id:
        categoryReference && typeof categoryReference === 'object' && '_id' in categoryReference
          ? categoryReference._id.toString()
          : product.category_id.toString(),
      category_name:
        categoryReference && typeof categoryReference === 'object' && 'name' in categoryReference
          ? categoryReference.name
          : undefined,
      is_active: product.is_active,
      createdAt: product.createdAt,
    };
  }
}
