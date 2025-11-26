import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { firstValueFrom } from 'rxjs';

export type PaymentStatus = 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED';
@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService, private httpService: HttpService) {}

  async initiatePayment(dto: any) {
    const reference = `REF-${uuidv4().slice(0, 8)}`;
    return this.prisma.payment.create({
      data: {
        reference,
        amount: dto.amount,
        currency: dto.currency,
        paymentMethod: dto.payment_method,
        customerPhone: dto.customer_phone,
        customerEmail: dto.customer_email,
        status: 'INITIATED',
        providerDetails: {},
      },
    });
  }

  async handleWebhook(data: { reference: string; status: string; provider_tx_id: string }) {
    const existing = await this.prisma.webhookEvent.findUnique({
      where: { providerTxId: data.provider_tx_id },
    });

    if (existing) {
      // Idempotent – already processed
      return;
    }

    const payment = await this.prisma.payment.findUnique({
      where: { reference: data.reference },
    });

    if (!payment) throw new BadRequestException('Payment not found');

    const allowedTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      INITIATED: ['PENDING'],
      PENDING: ['SUCCESS', 'FAILED'],
      SUCCESS: [],
      FAILED: [],
    };

    if (!allowedTransitions[payment.status as PaymentStatus]?.includes(data.status as PaymentStatus)) {
      throw new BadRequestException(`Invalid transition from ${payment.status} to ${data.status}`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { reference: data.reference },
        data: { status: data.status as PaymentStatus },
      });

      await tx.webhookEvent.create({
        data: {
          providerTxId: data.provider_tx_id,
          payload: data,
        },
      });
    });
  }

  async findByReference(reference: string) {
    return this.prisma.payment.findUnique({ where: { reference } });
  }

  async validateTokenWithAuthService(token: string): Promise<boolean> {
    try {      
      const res = await firstValueFrom(
        this.httpService.post(`http://auth-service:3000/api/v1/auth/validate`, { token }),
      );
      return res.data.valid === true;
    } catch {
      return false;
    }
  }
}