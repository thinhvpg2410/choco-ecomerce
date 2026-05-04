import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { User, UserStatus, UserRole } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { isUuid } from '../../common/utils/is-uuid';
import { UploadService } from '../../common/upload/upload.service';
import { extractCloudinaryPublicId } from '../../common/utils/extract-public-id';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

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
        ...(createUserDto.status !== undefined && {
          status: createUserDto.status,
        }),
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

  async setRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<void> {
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

  async updateUser(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        username: dto.username,
        phone: dto.phone,
        dob: dto.dob ? new Date(dto.dob) : undefined,
        gender: dto.gender,
        avatarUrl: dto.avatar_url,
      },
    });
    return this.toUserResponse(user);
  }

  // ==================== ADMIN ONLY - XÓA USER (SOFT DELETE) ====================
  async deleteUserByAdmin(userId: string): Promise<UserResponseDto> {
    if (!isUuid(userId)) {
      throw new NotFoundException('User not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Không cho xóa tài khoản Admin
    if (user.role === UserRole.admin) {
      throw new BadRequestException('Cannot delete admin account');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.inactive,
        refreshTokenHash: null,
      },
    });

    return this.toUserResponse(updatedUser);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    // 1. xoá ảnh cũ từ URL
    if (user.avatarUrl) {
      const publicId = extractCloudinaryPublicId(user.avatarUrl);

      if (publicId) {
        await this.uploadService.deleteImage(publicId);
      }
    }

    // 2. upload ảnh mới
    const url = await this.uploadService.uploadImage(file, 'users');

    // 3. update DB
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: url,
      },
    });

    return this.toUserResponse(updatedUser);
  }

  toUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      username: user.username || undefined,
      phone: user.phone || undefined,
      dob: user.dob?.toISOString() || undefined,
      gender: user.gender || undefined,
      avatar_url: user.avatarUrl || undefined,
    };
  }
}
