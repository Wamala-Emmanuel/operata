import { IsPhoneNumber, IsString, MinLength, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: '+256701234567' })
  @IsPhoneNumber('UG')
  phone: string;

  @ApiProperty({ example: 'mypassword123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'wamala@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;
}