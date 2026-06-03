import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { CreatePayPalOrderDto } from './dto/create-paypal-order.dto';

@Injectable()
export class PayPalService {
  private readonly clientId: string;
  private readonly secret: string;
  private readonly baseUrl: string;

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
    try {
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

      console.log('📤 Sending to PayPal:', JSON.stringify(payload, null, 2));

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
    } catch (error: any) {
      console.error('Lỗi API PayPal:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message);
    }
  }
  async captureOrder(orderId: string) {
    try {
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
    } catch (error: any) {
      console.error('Lỗi Capture:', error.response?.data || error.message);

      throw new Error(error.response?.data?.message || error.message);
    }
  }
}
