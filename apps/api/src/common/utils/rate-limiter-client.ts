// apps/api/src/common/utils/rate-limiter-client.ts

export class RateLimiterClient {
  private requestCounts = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly maxRequests: number = 10, // tối đa 10 request
    private readonly windowMs: number = 60000, // trong 60 giây
  ) {}

  /**
   * Kiểm tra xem có được phép gọi không
   * @param key - tên service đang gọi (vd: 'paypal', 'sepay', 'openai')
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.requestCounts.get(key);

    // Reset nếu đã qua window time
    if (!record || now > record.resetAt) {
      this.requestCounts.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    // Kiểm tra giới hạn
    if (record.count >= this.maxRequests) {
      return false; // Đã vượt giới hạn
    }

    record.count++;
    return true;
  }

  /**
   * Gọi external service có kiểm tra rate limit
   */
  async callWithLimit<T>(serviceKey: string, fn: () => Promise<T>): Promise<T> {
    if (!this.isAllowed(serviceKey)) {
      throw new Error(
        `Rate limit exceeded for service: ${serviceKey}. ` +
          `Max ${this.maxRequests} requests per ${this.windowMs / 1000}s`,
      );
    }
    return fn();
  }
}
