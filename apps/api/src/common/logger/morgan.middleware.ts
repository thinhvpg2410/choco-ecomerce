import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import morgan from 'morgan';
import { WinstonLoggerService } from './winston-logger.service';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  private readonly handler: RequestHandler;

  constructor(private readonly logger: WinstonLoggerService) {
    this.handler = morgan(':method :url :status :response-time ms', {
      stream: {
        write: (line: string) => {
          this.logger.log(line.trim(), 'HTTP');
        },
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.handler(req, res, next);
  }
}
