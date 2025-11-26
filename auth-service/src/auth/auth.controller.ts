import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import type { LoggerService } from '@nestjs/common';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new agent/user' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.phone, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.authService.login(user);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate JWT token (used by payment-service)' })
  async validateToken(@Body('token') token: string) {
    try {
      const payload = await this.authService.verifyToken(token);
      return { valid: true, userId: payload.sub };
    } catch {
      return { valid: false };
    }
  }
}