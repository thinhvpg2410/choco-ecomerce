import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { BrandsModule } from './modules/brands/brands.module';
import { UserAddressesModule } from './modules/user-addresses/user-addresses.module';
import { BannersModule } from './modules/banners/banners.module';
import { ProductImagesModule } from './modules/product-images/product-images.module';
import { AdminModule } from './modules/admin/admin.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './common/guards/optional-jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PrismaModule } from './prisma/prisma.module';
import { AppCacheModule } from './common/cache/cache.module';
import { PayPalModule } from './modules/paypal/paypal.module';
import { SepayModule } from './modules/sepay/sepay.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '../../.env'],
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 5,
      },
    ]),

    PrismaModule,
    AppCacheModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    ReviewsModule,
    CouponsModule,
    BrandsModule,
    UserAddressesModule,
    BannersModule,
    ProductImagesModule,
    AdminModule,
    PayPalModule,
    SepayModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    OptionalJwtAuthGuard,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
