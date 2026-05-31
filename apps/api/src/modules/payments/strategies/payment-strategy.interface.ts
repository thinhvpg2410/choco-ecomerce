import { Order, Payment, PaymentMethod } from '@prisma/client';
import { CreatePaymentDto } from '../dto/create-payment.dto';

export interface PaymentStrategyResult {
  success: boolean;
  message: string;
  payment: Payment;
  extra?: Record<string, any>;
}

export interface PaymentStrategy {
  supports(method: PaymentMethod): boolean;
  execute(
    order: Order & { payment?: Payment | null },
    dto: CreatePaymentDto,
  ): Promise<PaymentStrategyResult>;
}
