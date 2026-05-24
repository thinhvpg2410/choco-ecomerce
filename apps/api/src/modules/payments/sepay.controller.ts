import {
  Body,
  Controller,
  Post,
  Headers,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PaymentStatus, OrderStatus } from '@prisma/client'; // Thêm OrderStatus ở đây
import { PrismaService } from '../../prisma/prisma.service';

@Controller('sepay')
export class SepayController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('webhook')
  async webhook(@Body() body: any, @Headers('x-api-key') apiKey: string) {
    console.log('SEPAY WEBHOOK:', body);

    if (apiKey !== process.env.SEPAY_WEBHOOK_SECRET) {
      throw new UnauthorizedException('Webhook secret không hợp lệ');
    }

    const content = body.transactionContent || body.content;
    const amountIn = Number(body.amountIn || body.amount || 0);

    if (!content) {
      throw new BadRequestException('Dữ liệu không hợp lệ');
    }

    const payment = await this.prisma.payment.findFirst({
      where: { transactionCode: content },
    });

    if (!payment) {
      throw new BadRequestException('Không tìm thấy giao dịch tương ứng');
    }

    if (amountIn < Number(payment.amount)) {
      throw new BadRequestException('Số tiền thanh toán không đủ');
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật bảng Payment sang Đã thanh toán
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

      // 2. Cập nhật bảng Order: Chỉ đổi trạng thái thanh toán sang PAID
      // Trạng thái đơn hàng (status) vẫn tự động giữ nguyên là PENDING
      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: PaymentStatus.PAID,
        },
      });
    });

    return { success: true };
  }
}
