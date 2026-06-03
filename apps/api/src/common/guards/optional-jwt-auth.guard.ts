import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization as string | undefined;
    if (!authHeader) {
      return true;
    }
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return true;
    }
    return super.canActivate(context);
  }
}
