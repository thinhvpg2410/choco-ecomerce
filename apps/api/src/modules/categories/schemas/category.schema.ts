import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  collection: 'categories',
  timestamps: { createdAt: 'createdAt', updatedAt: false },
})
export class Category {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  createdAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
