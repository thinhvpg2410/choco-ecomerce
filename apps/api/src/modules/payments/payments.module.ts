import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentStrategyFactory } from './strategies/payment-strategy.factory';
import { CodPaymentStrategy } from './strategies/cod-payment.strategy';
import { PaypalPaymentStrategy } from './strategies/paypal-payment.strategy';
import { QrBankPaymentStrategy } from './strategies/qr-bank-payment.strategy';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentStrategyFactory,
    CodPaymentStrategy,
    PaypalPaymentStrategy,
    QrBankPaymentStrategy,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
