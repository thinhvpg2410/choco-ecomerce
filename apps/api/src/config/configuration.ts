export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '5000', 10),
  },
  database: {
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/choco-ecommerce',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'choco-ecommerce-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ?? 'choco-ecommerce-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
});
