import { Injectable, LoggerService } from '@nestjs/common';
import type { Logger as WinstonRootLogger } from 'winston';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  constructor(private readonly winston: WinstonRootLogger) {}

  private stringify(message: unknown): string {
    if (typeof message === 'string') {
      return message;
    }
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }

  log(message: unknown, context?: string): void {
    this.winston.info(this.stringify(message), { context });
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.winston.error(this.stringify(message), {
      context,
      stack: trace,
    });
  }

  warn(message: unknown, context?: string): void {
    this.winston.warn(this.stringify(message), { context });
  }

  debug(message: unknown, context?: string): void {
    this.winston.debug(this.stringify(message), { context });
  }

  verbose(message: unknown, context?: string): void {
    this.winston.verbose(this.stringify(message), { context });
  }
}
