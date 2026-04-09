import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { CartDataResponseDto } from '../../cart/dto/cart-response.dto';

export class AuthTokensDataDto {
  @ApiProperty()
  accessToken: string;

  @ApiPropertyOptional()
  refreshToken?: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiPropertyOptional({
    type: CartDataResponseDto,
    description: 'Present when guestCart was sent and merged on login',
  })
  cart?: CartDataResponseDto;
}

export class AuthTokensResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: AuthTokensDataDto })
  data: AuthTokensDataDto;
}
