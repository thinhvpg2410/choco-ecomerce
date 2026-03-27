import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async findAll() {
    const categories = await this.categoryModel.find().sort({ createdAt: -1 }).exec();
    return {
      success: true,
      message: 'Categories fetched successfully',
      data: categories.map((category) => this.toCategoryResponse(category)),
    };
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const createdCategory = await this.categoryModel.create(createCategoryDto);
    return {
      success: true,
      message: 'Category created successfully',
      data: this.toCategoryResponse(createdCategory),
    };
  }

  async update(categoryId: string, updateCategoryDto: UpdateCategoryDto) {
    this.validateObjectId(categoryId);
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(categoryId, updateCategoryDto, {
        returnDocument: 'after',
      })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }

    return {
      success: true,
      message: 'Category updated successfully',
      data: this.toCategoryResponse(updatedCategory),
    };
  }

  async remove(categoryId: string) {
    this.validateObjectId(categoryId);

    const category = await this.categoryModel.findById(categoryId).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const existingProducts = await this.productModel.countDocuments({
      category_id: category._id,
      is_active: true,
    });
    if (existingProducts > 0) {
      throw new BadRequestException('Cannot delete category with existing products');
    }

    await this.categoryModel.findByIdAndDelete(categoryId).exec();
    return { success: true, message: 'Category deleted successfully' };
  }

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Category not found');
    }
  }

  private toCategoryResponse(category: CategoryDocument) {
    return {
      id: category._id.toString(),
      name: category.name,
      description: category.description,
      createdAt: category.createdAt,
    };
  }
}
