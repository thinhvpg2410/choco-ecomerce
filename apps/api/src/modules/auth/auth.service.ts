import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { CartService } from '../cart/cart.service';
import type { CartDataResponseDto } from '../cart/dto/cart-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cartService: CartService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const createUserDto: CreateUserDto = {
      email: registerDto.email,
      password: hashedPassword,
      role: UserRole.user,
      status: UserStatus.active,
    };

    const createdUser = await this.usersService.create(createUserDto);
    const jwtPayload = {
      sub: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
    };
    const tokens = await this.generateTokenPair(jwtPayload);
    await this.saveRefreshTokenHash(createdUser.id, tokens.refreshToken);

    return {
      success: true,
      message: 'Register successfully',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: createdUser,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.active) {
      throw new UnauthorizedException('User account is inactive');
    }

    let mergedCart: CartDataResponseDto | undefined;
    if (loginDto.guestCart?.length) {
      const mergeResult = await this.cartService.mergeGuestCart(user.id, loginDto.guestCart);
      mergedCart = mergeResult.data;
    }

    const payload = this.buildJwtPayload(user);
    const tokens = await this.generateTokenPair(payload);
    await this.saveRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      success: true,
      message: '“Đăng nhập thành công',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: this.usersService.toUserResponse(user),
        ...(mergedCart !== undefined && { cart: mergedCart }),
      },
    };
  }

  verifyAccessToken(token: string): { sub: string } {
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret: this.configService.getOrThrow<string>('jwt.secret'),
      });
      return { sub: payload.sub };
    } catch {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }

  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Token làm mới không hợp lệ');
    }

    let payload: { sub: string; email: string; role: string };

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Token làm mới không hợp lệ');
    }

    const user = await this.usersService.findByIdWithRefreshToken(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Token làm mới không hợp lệ');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Token làm mới không hợp lệ');
    }

    const nextPayload = this.buildJwtPayload(user);
    const tokens = await this.generateTokenPair(nextPayload);
    await this.saveRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: this.usersService.toUserResponse(user),
      },
    };
  }

  private buildJwtPayload(user: { id: string; email: string; role: string }) {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  }

  private async generateTokenPair(payload: {
    sub: string;
    email: string;
    role: string;
  }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
        expiresIn: 604800,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshTokenHash(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setRefreshTokenHash(userId, refreshTokenHash);
  }
}
