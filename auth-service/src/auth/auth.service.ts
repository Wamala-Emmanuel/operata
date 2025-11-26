import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

interface RegisterDto {
  phone: string;
  password: string;
  email?: string;
}

interface LoginDto {
  phone: string;
  password: string;
}

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
  ) {}

  async register(dto: RegisterDto) {
    const { phone, password, email } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        phone,
        email,
        password: hashedPassword,
      },
      select: { id: true, phone: true, email: true, createdAt: true },
    });

    this.logger.log(`New user registered: ${phone}`);
    return user;
  }

  async validateUser(phone: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { phone: user.phone, sub: user.id };
    const token = this.jwtService.sign(payload);

    this.logger.log(`User logged in: ${user.phone}`);
    return {
      access_token: token,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
      },
    };
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, phone: true },
      });

      if (!user) return null;
      return payload;
    } catch (error) {
      this.logger.warn('Invalid or expired token presented');
      return null;
    }
  }
}