import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Not, Repository, UpdateResult } from 'typeorm';
import { EmailService } from '../shared/utils/email.service';
import { SendgridService } from '../shared/sms/sendgrid.service';
import { AuthResponseInterface } from '../shared/interfaces/auth.response.interface';
import { hashService, compareHash } from '../shared/utils/hash.service';
import {
  TokenInterface,
  tokensType,
} from '../shared/interfaces/token.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  emailTemplate,
  resetPasswordTemplate,
} from '../shared/utils/email.template';
import { ResetPasswordDto } from './dto/forgot.password.dto';
import { generateOtp, verifyOtp } from '../shared/helpers/otp.helper';
import { OtpsService } from '../otps/otps.service';
import { OtpInterface } from '../shared/interfaces/otp.interface';
import { CreateOtpDto } from '../otps/dto/create-otp.dto';
import { Otp } from '../otps/entities/otp.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private sendgridService: SendgridService,
    private emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly otpService: OtpsService,
  ) {}

  //signup user
  async signUp(data: SignupDto): Promise<AuthResponseInterface<User>> {
    const user = await this.checkUserExist(data.email); // check if user already exist
    if (user) {
      throw new BadRequestException('User already exist');
    }

    const hashedPassword = await hashService(data.password);
    try {
      const newUser = this.userRepository.create({
        ...data,
        password: hashedPassword,
        verified: false,
      });
      const createdUser = await this.userRepository.save(newUser);
      const TokenData = {
        id: createdUser.id,
        role: createdUser.role,
        verified: createdUser.verified,
      };
      const tokens: tokensType = await this.signToken(TokenData);
      const OTP: OtpInterface = generateOtp(4);
      const mail = this.emailService.confirmEmail(
        data.email,
        emailTemplate(OTP.otp),
        'Confirm your email',
      );
      await this.sendgridService.sendEmail(mail);
      await this.otpService.create(OTP, newUser);
      await this.saveRtHash(TokenData, tokens.refreshToken);
      return {
        message: 'verify you email to continue',
        tokens: tokens,
        data: createdUser,
      };
    } catch (err) {
      if (err.response && err.response.body && err.response.body.errors) {
        const errors = err.response.body.errors;
        console.log(errors);
      } else {
        console.log(err);
      }
      throw new InternalServerErrorException(err.message);
    }
  }

  async checkUserExist(email): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { email } });
    return !!user;
  }

  async login(login: LoginDto): Promise<AuthResponseInterface<any>> {
    const user = await this.userRepository.findOne({
      where: { email: login.email, verified: true },
    });

    if (!user) throw new ForbiddenException('access denied');
    const pwd = await compareHash(login.password, user.password);
    if (!pwd) throw new ForbiddenException('Email or password is incorrect');
    const data = {
      id: user.id,
      role: user.name,
      verified: user.verified,
    };
    const tokens: tokensType = await this.signToken(data);
    /* save token */
    await this.saveRtHash(data, tokens.refreshToken);

    return {
      message: 'login successfully',
      tokens: tokens,
      data: null,
    };
  }

  async logout(id: string): Promise<UpdateResult> {
    return await this.userRepository.update(
      { id: id, refreshToken: Not('null') },
      { refreshToken: null },
    );
  }

  async verifyEmail(otpData: CreateOtpDto) {
    const otpExists: Otp = await this.otpService.findOne(otpData.otp);
    if (!otpExists) throw new BadRequestException('Invalid OTP');

    const isValid = verifyOtp(otpExists.expiresAt);

    if (!isValid) throw new BadRequestException('OTP expired');

    const user = await this.userRepository.findOne({
      where: { id: otpExists.userId },
    });
    if (!user) throw new ForbiddenException('Invalid token');
    await this.userRepository.update(user.id, { verified: true });
    await this.otpService.delete(otpExists.id);
    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  async saveRtHash(data: TokenInterface, rt: string): Promise<any> {
    const hash = await hashService(rt);
    await this.userRepository.update(data.id, { refreshToken: hash });
  }
  async signToken(data: TokenInterface): Promise<any> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(data, {
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(data, {
        expiresIn: '7d',
      }),
    ]);
    return {
      accessToken: at,
      refreshToken: rt,
    };
  }
  async refreshToken(
    id: string,
    role: string,
    verified: boolean,
  ): Promise<AuthResponseInterface<any>> {
    const tokens: tokensType = await this.signToken({ id, role, verified });
    await this.saveRtHash({ id, role, verified }, tokens.refreshToken);
    return {
      message: 'Refresh token generated successfully',
      tokens: tokens,
      data: null,
    };
  }
  async forgotPassword(email: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new ForbiddenException('Invalid email');
    const token = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
    });
    const reset_url =
      this.configService.get('BASE_URL') + '/auth/reset-password/' + token;
    const mail = this.emailService.confirmEmail(
      email,
      resetPasswordTemplate(reset_url),
      'Request to reset Password',
    );
    try {
      await this.sendgridService.sendEmail(mail);
      return {
        success: true,
        message: 'Reset password link sent to your email',
      };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
  async resetPassword(data: ResetPasswordDto, token: string): Promise<any> {
    const { id, iat } = await this.jwtService.verifyAsync(token);

    const user = await this.userRepository.findOne({ where: { id } });

    if (new Date(iat * 1000) < user.updatedAt)
      throw new ForbiddenException('Token expired');

    if (!user) throw new ForbiddenException('Invalid token');
    const hashedPassword = await hashService(data.password);
    const isMatch = await compareHash(data.password, user.password);
    if (isMatch)
      throw new BadRequestException(
        'New password must be different from old one',
      );
    try {
      await this.userRepository.update(id, {
        password: hashedPassword,
        updatedAt: new Date(),
      });
      await this.jwtService;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
    return {
      success: true,
      message: 'Password updated successfully',
    };
  }
  async signVerification(data: TokenInterface) {
    const [at] = await Promise.all([
      this.jwtService.signAsync(data, {
        expiresIn: '15m',
      }),
    ]);
    return {
      verification: at,
    };
  }
}
