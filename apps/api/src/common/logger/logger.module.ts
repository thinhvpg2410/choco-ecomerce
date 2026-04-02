import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createWinstonRootLogger } from './winston.factory';
import { WinstonLoggerService } from './winston-logger.service';
import { MorganMiddleware } from './morgan.middleware';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: WinstonLoggerService,
      useFactory: (config: ConfigService) => {
        const winstonLogger = createWinstonRootLogger({
          level: config.get<string>('logging.level') ?? 'info',
          logDir: config.get<string>('logging.dir') ?? 'logs',
          maxFiles: config.get<string>('logging.maxFiles') ?? '14d',
        });
        return new WinstonLoggerService(winstonLogger);
      },
      inject: [ConfigService],
    },
    MorganMiddleware,
  ],
  exports: [WinstonLoggerService, MorganMiddleware],
})
export class LoggerModule {}
