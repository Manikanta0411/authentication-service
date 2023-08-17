import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from './refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';

@Module({
  imports: [
    JwtModule.register({
      secret:
        'f3a43d7f0ea84f5f3569c8c7cb5d5d63913bf843b1b781d69f312bce85863b21',
      signOptions: { expiresIn: '30s' },
    }),
    TypeOrmModule.forFeature([User, RefreshToken]), // Import UserRepository
    // ... other imports
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenService],
})
export class AuthModule {}
