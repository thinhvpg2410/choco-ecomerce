import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { execSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { config } from 'dotenv';
import { AppModule } from './../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';

config({ path: resolve(__dirname, '../.env') });

jest.setTimeout(60000);

const databaseUrl = process.env.E2E_DATABASE_URL ?? process.env.DATABASE_URL;
const describeE2e = databaseUrl ? describe : describe.skip;

describeE2e('Auth, Products, Categories (e2e)', () => {
  let app: INestApplication<App>;

  let adminAccessToken = '';
  let adminRefreshToken = '';
  let categoryId = '';
  let productId = '';

  beforeAll(async () => {
    process.env.DATABASE_URL = databaseUrl;
    const apiRoot = join(__dirname, '..');
    execSync('npx prisma migrate deploy', {
      cwd: apiRoot,
      stdio: 'inherit',
      env: { ...process.env },
    });

    process.env.JWT_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('registers admin user', async () => {
    const response = await request(app.getHttpServer()).post('/api/auth/register').send({
      email: 'admin@test.com',
      password: 'StrongPass123',
      role: 'admin',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('admin@test.com');
    expect(response.body.data.user.password).toBeUndefined();
    adminAccessToken = response.body.data.accessToken;
    adminRefreshToken = response.body.data.refreshToken;
  });

  it('logs in and returns token pair', async () => {
    const response = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'StrongPass123',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
    adminAccessToken = response.body.data.accessToken;
    adminRefreshToken = response.body.data.refreshToken;
  });

  it('refreshes access token', async () => {
    const response = await request(app.getHttpServer()).post('/api/auth/refresh').send({
      refreshToken: adminRefreshToken,
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
    adminAccessToken = response.body.data.accessToken;
    adminRefreshToken = response.body.data.refreshToken;
  });

  it('creates category as admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: 'Dark Chocolate',
        description: 'Dark chocolate products',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    categoryId = response.body.data.id;
  });

  it('creates product as admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .send({
        name: 'Dark 80%',
        description: 'Strong cocoa flavor',
        price: 12.5,
        stock: 20,
        images: ['https://example.com/dark-80.jpg'],
        category_id: categoryId,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    productId = response.body.data.id;
  });

  it('lists products with search and pagination', async () => {
    const response = await request(app.getHttpServer()).get(
      `/api/products?page=1&limit=10&search=Dark&category_id=${categoryId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items.length).toBeGreaterThan(0);
    expect(response.body.data.pagination.page).toBe(1);
  });

  it('blocks deleting category with active products', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('soft deletes product', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('deletes category after product is inactive', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminAccessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('rejects invalid refresh token', async () => {
    const response = await request(app.getHttpServer()).post('/api/auth/refresh').send({
      refreshToken: 'invalid.refresh.token',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
