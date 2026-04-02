import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtRequestUser } from '../types/jwt-request-user';


export const OptionalUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtRequestUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtRequestUser | undefined;
  },
);
