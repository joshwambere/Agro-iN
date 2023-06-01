import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../shared/utils/email.service';
import { SendgridService } from '../shared/sms/sendgrid.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthStrategy } from './startegies/auth.strategy';
import { RefreshStartegy } from './startegies/refresh.startegy';
import { UsersModule } from '../users/users.module';
import { OtpsService } from '../otps/otps.service';
import { Otp } from '../otps/entities/otp.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Otp]),
    PassportModule.register({
      session: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => UsersModule),
  ],
  providers: [
    AuthService,
    EmailService,
    SendgridService,
    AuthStrategy,
    RefreshStartegy,
    OtpsService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
