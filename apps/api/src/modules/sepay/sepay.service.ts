// sepay.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class SepayService {
  constructor(private readonly prisma: PrismaService) {}

  async handleWebhook(body: any, authorization: string) {
    console.log('🔥 WEBHOOK RECEIVED');

    console.log('AUTH HEADER:', authorization);
    console.log('BODY:', body);

    const expected = 'Apikey ChocoShopHaoPhamahihi123';

    if (authorization !== expected) {
      console.log('INVALID API KEY');
      throw new UnauthorizedException('Webhook secret không hợp lệ');
    }

    const content = body.transactionContent || body.content || '';

    // SePay gửi transferAmount chứ không phải amount
    const amount = Number(
      body.transferAmount || body.amountIn || body.amount || 0,
    );

    console.log('CONTENT:', content);
    console.log('AMOUNT:', amount);

    const match = content.match(/DH[A-Z0-9]+/i);

    console.log('MATCH:', match);

    if (!match) {
      console.log('NO TRANSACTION CODE');
      return { success: false };
    }

    const transactionCode = match[0].toUpperCase();

    console.log('TRANSACTION CODE:', transactionCode);

    const payment = await this.prisma.payment.findFirst({
      where: { transactionCode },
    });

    console.log('PAYMENT FOUND:', payment);

    if (!payment) {
      console.log('PAYMENT NOT FOUND');
      return { success: false };
    }

    if (payment.paymentStatus === PaymentStatus.PAID) {
      console.log('ALREADY PAID');
      return { success: true };
    }

    if (amount < Number(payment.amount)) {
      console.log('NOT ENOUGH MONEY');
      return { success: false };
    }

    console.log('🔥 START UPDATE PAYMENT');

    try {
      await this.prisma.$transaction(async (tx) => {
        console.log('UPDATING PAYMENT');

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            paymentStatus: PaymentStatus.PAID,
            paidAt: new Date(),
          },
        });

        console.log('PAYMENT UPDATED');

        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: PaymentStatus.PAID,
          },
        });

        console.log('Đơn hàng đã được cập nhật trạng thái thanh toán');
      });

      console.log('Thanh toán thành công cho đơn hàng:', payment.orderId);
    } catch (err) {
      console.error('Lỗi webhook:', err);
      throw err;
    }

    return { success: true };
  }

  // 👇 API cho frontend check
  async getPaymentStatus(orderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      select: {
        paymentStatus: true,
        amount: true,
        paidAt: true,
        transactionCode: true,
      },
    });

    return payment;
  }
}
