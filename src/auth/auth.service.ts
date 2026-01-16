import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { HashingService } from './hashing/hashing.service';
import { InjectRepository } from '@nestjs/typeorm';
import jwtConfig from './config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDTO) {
    let passWordIsValid = false;
    let throwError = true;
    const user = await this.userRepository.findOneBy({
      email: loginDto.email,
      active: true,
    });

    if (!user) {
      throw new UnauthorizedException('User not authorized');
    }

    if (user) {
      passWordIsValid = await this.hashService.compare(
        loginDto.password,
        user.passwordHash,
      );
    }

    if (passWordIsValid) {
      throwError = false;
    }

    if (throwError) {
      throw new UnauthorizedException('User invalid');
    }

    return this.CreateTokens(user);
  }

  private async CreateTokens(user: User) {
    const acessTokenPromisse = this.SignJWTAssync<Partial<User>>(
      user.id,
      this.jwtConfiguration.jwtTtl,
      { email: user.email },
    );

    const refreshTokenPromisse = this.SignJWTAssync(
      user.id,
      this.jwtConfiguration.JwtRefreshTtl,
    );

    const [acessToken, refreshToken] = await Promise.all([
      acessTokenPromisse,
      refreshTokenPromisse,
    ]);

    return {
      acessToken,
      refreshToken,
    };
  }

  private async SignJWTAssync<T>(sub: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        this.jwtConfiguration,
      );
      const user = await this.userRepository.findOneBy({
        id: sub,
        active: true,
      });

      if (!user) {
        throw new Error('User not Authorized');
      }
      return this.CreateTokens(user);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
