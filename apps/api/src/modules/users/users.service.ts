import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { isUuid } from '../../common/utils/is-uuid';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const createdUser = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: createUserDto.password,
        avatarUrl: '/user.jpg', // Default avatar
        ...(createUserDto.role !== undefined && { role: createUserDto.role }),
        ...(createUserDto.status !== undefined && { status: createUserDto.status }),
      },
    });
    return this.toUserResponse(createdUser);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toUserResponse(user) : null;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByIdWithRefreshToken(userId: string): Promise<User | null> {
    if (!isUuid(userId)) {
      return null;
    }

    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async setRefreshTokenHash(userId: string, refreshTokenHash: string | null): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  async findById(userId: string): Promise<UserResponseDto> {
    if (!isUuid(userId)) {
      throw new NotFoundException('User not found');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toUserResponse(user);
  }

  toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      avatar_url: user.avatarUrl || undefined,
    };
  }
}
