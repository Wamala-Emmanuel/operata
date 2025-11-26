import { IsEnum, IsNumber, IsString, IsEmail, IsPhoneNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiatePaymentDto {
  @ApiProperty({ example: 50000, description: 'Amount in UGX cents' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'UGX', enum: ['UGX', 'USD'] })
  @IsEnum(['UGX', 'USD'])
  currency: string;

  @ApiProperty({ example: 'MOBILE_MONEY', enum: ['MOBILE_MONEY', 'CARD'] })
  @IsEnum(['MOBILE_MONEY', 'CARD'])
  @IsNotEmpty()
  payment_method: string;

  @ApiProperty({ example: '+256771234567' })
  @IsPhoneNumber('UG')
  customer_phone: string;

  @ApiProperty({ example: 'wamala@example.com', required: false })
  @IsEmail()
  @IsOptional()
  customer_email?: string | null;
}