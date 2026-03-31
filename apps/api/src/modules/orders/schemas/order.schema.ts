import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0.01 })
  price: number;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({
  collection: 'orders',
  timestamps: { createdAt: 'createdAt', updatedAt: false },
})
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true, default: [] })
  items: OrderItem[];

  @Prop({ required: true, min: 0.01 })
  total_amount: number;

  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Prop({ required: true, trim: true })
  receiver_name: string;

  @Prop({ required: true, trim: true })
  receiver_phone: string;

  @Prop({ required: true, trim: true })
  shipping_address: string;

  @Prop({ required: true, trim: true })
  payment_method: string;

  createdAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
