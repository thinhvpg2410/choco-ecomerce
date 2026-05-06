import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';

@Injectable()
export class UserAddressesService {
  constructor(private prisma: PrismaService) {}

  // create(createUserAddressDto: CreateUserAddressDto) {
  //   return this.prisma.userAddress.create({
  //     data: createUserAddressDto,
  //   });
  // }

  create(userId: string, dto: CreateUserAddressDto) {
  return this.prisma.userAddress.create({
    data: {
      userId,
      ...dto,
    },
  });
}

  findAll(userId: string) {
    return this.prisma.userAddress.findMany({
      where: { userId },
    });
  }

  findOne(id: string) {
    return this.prisma.userAddress.findUnique({
      where: { id },
    });
  }

  update(id: string, updateUserAddressDto: UpdateUserAddressDto) {
    return this.prisma.userAddress.update({
      where: { id },
      data: updateUserAddressDto,
    });
  }

  remove(id: string) {
    return this.prisma.userAddress.delete({
      where: { id },
    });
  }
}