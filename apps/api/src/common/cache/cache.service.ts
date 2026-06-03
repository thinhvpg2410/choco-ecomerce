import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import {
  categoriesCacheKey,
  productDetailCacheKey,
  productsListCacheKey,
  TTL_CATEGORIES,
  TTL_PRODUCT_DETAIL,
  TTL_PRODUCTS_LIST,
} from './cache.constants';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis | null = null;
  private readonly enabled: boolean;
  private readonly keyPrefix: string;
  private readonly defaultTtlSeconds: number;

  constructor(private readonly configService: ConfigService) {
    const redis = this.configService.get<{
      host: string;
      port: number;
      password?: string;
      db: number;
      ttlSeconds: number;
      keyPrefix: string;
      enabled: boolean;
    }>('redis');
    this.enabled = redis?.enabled ?? false;
    this.keyPrefix = redis?.keyPrefix ?? 'choco:';
    this.defaultTtlSeconds = redis?.ttlSeconds ?? 60;
  }

  onModuleInit(): void {
    if (!this.enabled) {
      this.logger.warn('Redis cache disabled (REDIS_ENABLED=false)');
      return;
    }
    const host = this.configService.getOrThrow<string>('redis.host');
    const port = this.configService.getOrThrow<number>('redis.port');
    const password = this.configService.get<string>('redis.password');
    const db = this.configService.get<number>('redis.db') ?? 0;

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      db,
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });

    this.client.on('error', (err) => {
      this.logger.warn(`Redis: ${err.message}`);
    });

    void this.client
      .connect()
      .then(() => this.logger.log(`Redis cache connected at ${host}:${port}`))
      .catch((err) => {
        this.logger.error(`Redis connect failed: ${err?.message ?? err}`);
        this.client?.disconnect();
        this.client = null;
      });
  }

  onModuleDestroy(): void {
    this.client?.disconnect();
    this.client = null;
  }

  isReady(): boolean {
    return Boolean(this.client?.status === 'ready');
  }

  productsListKey(
    page: number,
    limit: number,
    search: string,
    categoryId: string,
  ): string {
    return productsListCacheKey(
      this.keyPrefix,
      page,
      limit,
      search,
      categoryId,
    );
  }

  productDetailKey(productId: string): string {
    return productDetailCacheKey(this.keyPrefix, productId);
  }

  categoriesKey(): string {
    return categoriesCacheKey(this.keyPrefix);
  }

  async get<T>(key: string): Promise<T | undefined> {
    if (!this.isReady()) return undefined;
    try {
      const raw = await this.client!.get(key);
      if (raw === null) return undefined;
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.isReady()) return;
    const ttl = ttlSeconds ?? this.defaultTtlSeconds;
    try {
      await this.client!.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (err) {
      this.logger.warn(
        `Redis SET failed for ${key}: ${(err as Error).message}`,
      );
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isReady()) return;
    try {
      await this.client!.unlink(key);
    } catch (err) {
      this.logger.warn(
        `Redis DEL failed for ${key}: ${(err as Error).message}`,
      );
    }
  }

  /** SCAN + UNLINK — use for invalidating list caches */
  async deleteByPattern(pattern: string): Promise<void> {
    if (!this.isReady()) return;
    try {
      let cursor = '0';
      do {
        const [next, keys] = await this.client!.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          128,
        );
        cursor = next;
        if (keys.length > 0) {
          await this.client!.unlink(...keys);
        }
      } while (cursor !== '0');
    } catch (err) {
      this.logger.warn(
        `Redis deleteByPattern failed (${pattern}): ${(err as Error).message}`,
      );
    }
  }

  async invalidateAfterProductWrite(productId: string): Promise<void> {
    await Promise.all([
      this.del(this.productDetailKey(productId)),
      this.deleteByPattern(`${this.keyPrefix}products:page:*`),
    ]);
  }

  async invalidateAfterCategoryWrite(): Promise<void> {
    await Promise.all([
      this.del(this.categoriesKey()),
      this.deleteByPattern(`${this.keyPrefix}products:page:*`),
      this.deleteByPattern(`${this.keyPrefix}product:*`),
    ]);
  }

  readonly ttl = {
    productsList: TTL_PRODUCTS_LIST,
    productDetail: TTL_PRODUCT_DETAIL,
    categories: TTL_CATEGORIES,
  } as const;
}
