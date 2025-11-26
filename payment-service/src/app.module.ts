import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';                 
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { WinstonModule } from 'nest-winston'; 
import { format, transports } from 'winston';
import { PrismaService } from './prisma/prisma.service';
import { PaymentsModule } from './payments/payments.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrometheusModule.register({
      defaultMetrics: { enabled: true },
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
    PaymentsModule,
    WebhookModule,
    WinstonModule.forRoot({
      level: 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json(),
        format.colorize({ all: true })
      ),
      transports: [new transports.Console()],
    }),
  ],
  providers: [
    PrismaService,
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          disableErrorMessages: false,
          forbidUnknownValues: true,
        }),
    },
  ],
})
export class AppModule {}