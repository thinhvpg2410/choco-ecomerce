import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { UsersService } from '../users/users.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthTokensResponseDto } from './dto/auth-tokens-response.dto';
import { CurrentUserResponseDto } from './dto/current-user-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Public()
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(registerDto);
    this.setRefreshTokenCookie(response, result.data.refreshToken);
    return {
      success: true,
      message: 'Register successfully',
      data: {
        accessToken: result.data.accessToken,
        user: result.data.user,
      },
    };
  }

  @ApiOperation({ summary: 'Login and get token pair' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);
    this.setRefreshTokenCookie(response, result.data.refreshToken);
    return {
      success: true,
      message: 'Login successfully',
      data: {
        accessToken: result.data.accessToken,
        user: result.data.user,
        ...(result.data.cart !== undefined && { cart: result.data.cart }),
      },
    };
  }

  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @Public()
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const refreshToken = request.cookies?.refreshToken;

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token is required');
      }

      const result = await this.authService.refreshTokens(refreshToken);

      this.setRefreshTokenCookie(response, result.data.refreshToken);

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.data.accessToken,
          user: result.data.user,
        },
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }

  @ApiOperation({ summary: 'Logout current user' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: CurrentUserResponseDto })
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const jwtUser = request.user as { sub: string };
    if (jwtUser?.sub) {
      await this.usersService.setRefreshTokenHash(jwtUser.sub, null);
    }
    response.clearCookie('refreshToken', this.refreshTokenCookieOptions);
    return {
      success: true,
      message: 'Logged out successfully',
      data: null,
    };
  }

  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: CurrentUserResponseDto })
  @Get('me')
  async getCurrentUser(@Req() request: Request) {
    const jwtUser = request.user as { sub: string };
    const user = await this.usersService.findById(jwtUser.sub);
    return {
      success: true,
      message: 'Current user fetched successfully',
      data: user,
    };
  }

  private get refreshTokenCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }

  private setRefreshTokenCookie(response: Response, refreshToken: string) {
    response.cookie(
      'refreshToken',
      refreshToken,
      this.refreshTokenCookieOptions,
    );
  }
}
