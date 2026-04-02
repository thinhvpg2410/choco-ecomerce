import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../guards/optional-jwt-auth.guard';

export function OptionalAuth() {
  return applyDecorators(UseGuards(OptionalJwtAuthGuard), ApiBearerAuth());
}
