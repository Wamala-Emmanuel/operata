import { IsPhoneNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '+256701234567' })
  @IsPhoneNumber('UG')
  phone: string;

  @ApiProperty({ example: 'mypassword123' })
  @IsString()
  password: string;
}