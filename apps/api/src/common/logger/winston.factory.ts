import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export type WinstonFactoryOptions = {
  level: string;
  logDir: string;
  maxFiles: string;
};

export function createWinstonRootLogger(options: WinstonFactoryOptions): winston.Logger {
  const logDir = join(process.cwd(), options.logDir);
  mkdirSync(logDir, { recursive: true });

  const jsonFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  );

  const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => {
      const { timestamp, level, message, context, stack, ...meta } = info;
      const ctx = typeof context === 'string' && context ? `[${context}]` : '';
      const rest =
        meta && typeof meta === 'object' && Object.keys(meta as object).length > 0
          ? ` ${JSON.stringify(meta)}`
          : '';
      const trace = typeof stack === 'string' ? `\n${stack}` : '';
      return `${timestamp} ${level} ${ctx} ${String(message)}${rest}${trace}`;
    }),
  );

  return winston.createLogger({
    level: options.level,
    transports: [
      new winston.transports.Console({
        format: consoleFormat,
      }),
      new DailyRotateFile({
        dirname: logDir,
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxFiles: options.maxFiles,
        format: jsonFormat,
      }),
      new DailyRotateFile({
        dirname: logDir,
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        zippedArchive: true,
        maxFiles: options.maxFiles,
        format: jsonFormat,
      }),
    ],
  });
}
