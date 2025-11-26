import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PaymentsService } from '../payments/payments.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

class WebhookDto {
  reference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  provider_tx_id: string;
  timestamp: string;
}

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'MTN/Airtel-style provider callback' })
  @ApiBody({ type: WebhookDto })
  async handleProviderCallback(@Body() body: WebhookDto) {
    this.logger.log(`Webhook received → ${body.reference} | ${body.status}`);

    try {
      await this.paymentsService.handleWebhook({
        reference: body.reference,
        status: body.status,
        provider_tx_id: body.provider_tx_id,
      });
      return { success: true, message: 'Processed' };
    } catch (error) {
      // Idempotency error = 200 OK (already processed)
      if (error.message.includes('Unique constraint')) {
        this.logger.warn(`Duplicate webhook ignored → ${body.provider_tx_id}`);
        return { success: true, message: 'Already processed' };
      }
      throw error;
    }
  }
}