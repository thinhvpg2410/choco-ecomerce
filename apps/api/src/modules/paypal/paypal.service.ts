import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreatePayPalOrderDto } from './dto/create-paypal-order.dto';

import { RateLimiterClient } from '../../common/utils/rate-limiter-client';

@Injectable()
export class PayPalService {
  private readonly clientId: string;
  private readonly secret: string;
  private readonly baseUrl: string;

  //Khởi tạo: tối đa 10 request / 60 giây tới PayPal
  private readonly rateLimiter = new RateLimiterClient(10, 60_000);

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID')!;
    this.secret = this.configService.get<string>('PAYPAL_SECRET')!;
    this.baseUrl = 'https://api.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.secret}`).toString(
      'base64',
    );
    const { data } = await axios.post(
      `${this.baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return data.access_token;
  }

  async createOrder(dto: CreatePayPalOrderDto) {
    // ✅ Dùng callWithLimit — tự check + throw nếu vượt giới hạn
    return this.rateLimiter.callWithLimit('paypal-create-order', async () => {
      console.log('📨 Yêu cầu tạo đơn hàng PayPal: ', dto);

      if (!dto.amount || dto.amount <= 0) {
        throw new Error(`Invalid amount: ${dto.amount}`);
      }

      const accessToken = await this.getAccessToken();
      const payload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: dto.currency || 'USD',
              value: dto.amount.toFixed(2),
            },
            description: dto.description || 'Thanh toán đơn hàng Choco Kingdom',
          },
        ],
      };

      const { data } = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Tạo đơn hàng PayPal thành công: ', data.id);
      return data;
    });
  }

  async captureOrder(orderId: string) {
    return this.rateLimiter.callWithLimit('paypal-capture', async () => {
      const accessToken = await this.getAccessToken();
      const { data } = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return data;
    });
  }
}
