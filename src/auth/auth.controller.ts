import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/user/create-user.dto';
import { LoginDto } from 'src/user/login.dto';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const token = await this.authService.login(loginDto);
    return { message: 'Login successful', token };
  }

  @Post('refresh-token')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    const newAccessToken = await this.authService.refreshTokens(
      refreshTokenDto.token,
    );
    return { accessToken: newAccessToken };
  }
}
