import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { PaymentsService } from '../payments/payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [WebhookController],
  providers: [PaymentsService, PrismaService],
})
export class WebhookModule {}