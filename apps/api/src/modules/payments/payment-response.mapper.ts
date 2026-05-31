import { PaymentStatus, Prisma } from '@prisma/client';

export function mapPaymentToResponse(payment: {
  id: string;
  orderId: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  amount: Prisma.Decimal;
  transactionCode: string | null;
  createdAt: Date;
  paidAt: Date | null;
}) {
  const paymentStatus =
    payment.paymentStatus === PaymentStatus.PAID ? 'PAID' : 'PENDING';

  return {
    id: payment.id,
    order_id: payment.orderId,
    payment_method: payment.paymentMethod,
    payment_status: paymentStatus,
    transaction_code: payment.transactionCode ?? undefined,
    amount: Number(payment.amount),
    ...(paymentStatus === 'PAID' && {
      paid_at: payment.paidAt?.toISOString(),
    }),
    created_at: payment.createdAt.toISOString(),
  };
}
