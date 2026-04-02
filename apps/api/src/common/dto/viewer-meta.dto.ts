import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class ViewerMetaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;
}

export class PublicResponseMetaDto {
  @ApiProperty({ type: ViewerMetaDto })
  viewer: ViewerMetaDto;
}
