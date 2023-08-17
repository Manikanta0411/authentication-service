import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity'; // Import your User entity
import { CreateUserDto } from 'src/user/create-user.dto';
import { LoginDto } from 'src/user/login.dto';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = new User();
    user.username = createUserDto.username;
    user.password = await bcrypt.hash(createUserDto.password, 10);

    await this.userRepository.save(user);
    return { message: 'User registered successfully' };
  }

  async login(credentials: LoginDto) {
    const options: FindOneOptions<User> = {
      where: { username: credentials.username },
    };

    const user = await this.userRepository.findOne(options);
    if (!user) throw new NotFoundException('User not found');

    const passwordMatch = await bcrypt.compare(
      credentials.password,
      user.password,
    );
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { username: user.username, sub: user.id };
    const token = this.jwtService.sign(payload);
    const refreshToken =
      await this.refreshTokenService.createRefreshToken(user);

    console.log('Token body: ', token);
    return { access_token: token, refresh_token: refreshToken };
  }

  async generateTokens(user: User) {
    const accessToken = this.jwtService.sign({ sub: user.id });
    const refreshToken =
      await this.refreshTokenService.createRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    const refreshData =
      await this.refreshTokenService.validateRefreshToken(refreshToken);
    if (!refreshData) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.jwtService.sign({ sub: refreshData.user.id });
    return accessToken;
  }
}
