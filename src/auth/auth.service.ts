import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmailWithPassword(dto.email);
    if (existing) throw new ConflictException('Email is already registered');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create(dto.email, dto.name, passwordHash);
    return this.issueToken(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    const valid = user && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !valid) throw new UnauthorizedException('Invalid email or password');
    return this.issueToken(user.id, user.email);
  }

  private async issueToken(userId: string, email: string) {
    const accessToken = await this.jwtService.signAsync({ sub: userId, email });
    return { accessToken, tokenType: 'Bearer' };
  }
}
