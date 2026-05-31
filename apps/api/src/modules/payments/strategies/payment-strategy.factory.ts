import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentMethod } from '@prisma/client';
import { PaymentStrategy } from './payment-strategy.interface';
import { CodPaymentStrategy } from './cod-payment.strategy';
import { PaypalPaymentStrategy } from './paypal-payment.strategy';
import { QrBankPaymentStrategy } from './qr-bank-payment.strategy';

@Injectable()
export class PaymentStrategyFactory {
  private readonly strategies: PaymentStrategy[];

  constructor(
    private readonly codStrategy: CodPaymentStrategy,
    private readonly paypalStrategy: PaypalPaymentStrategy,
    private readonly qrBankStrategy: QrBankPaymentStrategy,
  ) {
    this.strategies = [
      this.codStrategy,
      this.paypalStrategy,
      this.qrBankStrategy,
    ];
  }

  getStrategy(method: PaymentMethod): PaymentStrategy {
    const strategy = this.strategies.find((item) => item.supports(method));
    if (!strategy) {
      throw new BadRequestException('Phương thức thanh toán không được hỗ trợ');
    }
    return strategy;
  }
}
