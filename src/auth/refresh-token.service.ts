import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from 'src/user/user.entity';
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async createRefreshToken(user: User) {
    const token = this.generateRefreshToken();
    const expiresAt = this.calculateRefreshTokenExpiration();
    const refreshToken = this.refreshTokenRepository.create({
      token,
      user,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  async validateRefreshToken(token: string): Promise<{ user: User }> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!refreshToken) {
      return null;
    }
    return { user: refreshToken.user };
  }

  //generating random refresh token
  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  // Calculate the expiration time for the refresh token
  calculateRefreshTokenExpiration(): Date {
    const now = new Date();
    const expirationTime = now.getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days
    const expirationDate = new Date(expirationTime);
    return expirationDate;
  }
}
