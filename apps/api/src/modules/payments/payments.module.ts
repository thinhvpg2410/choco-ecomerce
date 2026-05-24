import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { SepayController } from './sepay.controller';

@Module({
  controllers: [PaymentsController, SepayController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
