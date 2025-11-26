import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Headers,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate mobile money payment' })
  async initiate(
    @Headers('authorization') auth: string,
    @Body() dto: InitiatePaymentDto,
  ) {
    const token = auth?.replace('Bearer ', '');
    if (!token || !(await this.paymentsService.validateTokenWithAuthService(token))) {
      throw new UnauthorizedException('Invalid or missing token');
    }

    return this.paymentsService.initiatePayment(dto);
  }

  @Get(':reference')
  async getByReference(@Param('reference') reference: string) {
    const payment = await this.paymentsService.findByReference(reference);
    if (!payment) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    return payment;
  }
}