import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request as RequestType } from 'express';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { compareHash } from '../../shared/utils/hash.service';

@Injectable()
export class RefreshStartegy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    @InjectRepository(User)
    private authRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: RequestType) => {
          const token = req.cookies;
          if (!token) throw new BadRequestException('EXPIRED TOKEN');
          return req.cookies.refreshToken;
        },
      ]),
      secretOrKey: configService.get('JWT_SECRET'),
      passReqToCallback: true,
    });
  }
  async validate(req: RequestType, payload: any) {
    if (!payload) throw new BadRequestException();
    const { id } = payload;
    const user = await this.authRepository.findOne({ where: { id } });
    if (!user) throw new UnauthorizedException('Invalid Token');
    const checkMatch = await compareHash(
      req.cookies.refreshToken,
      user.refreshToken,
    );
    if (!checkMatch) throw new UnauthorizedException('Invalid Token');
    return user;
  }
}
