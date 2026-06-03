export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '5000', 10),
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB ?? '0', 10),
    /** Default TTL for cache entries (seconds) */
    ttlSeconds: parseInt(process.env.REDIS_TTL_SECONDS ?? '60', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX ?? 'choco:',
    enabled: process.env.REDIS_ENABLED !== 'false',
  },
  database: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/choco_ecommerce',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'choco-ecommerce-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ?? 'choco-ecommerce-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
});
