// sepay.controller.ts
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  HttpCode,
} from '@nestjs/common';
import { SepayService } from './sepay.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('sepay')
export class SepayController {
  constructor(private readonly sepayService: SepayService) {}

  @Public()
  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.sepayService.handleWebhook(body, authorization);
  }

  // frontend gọi mỗi 3s
  @Public()
  @Get('payment/:orderId')
  async getStatus(@Param('orderId') orderId: string) {
    return this.sepayService.getPaymentStatus(orderId);
  }
}
