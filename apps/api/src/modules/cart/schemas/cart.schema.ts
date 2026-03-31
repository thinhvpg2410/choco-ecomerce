import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ _id: false })
export class CartItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product_id: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0.01 })
  price: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({
  collection: 'carts',
  timestamps: { createdAt: false, updatedAt: 'updatedAt' },
})
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user_id: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];

  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
