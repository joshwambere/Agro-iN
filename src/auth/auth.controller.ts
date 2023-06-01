import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot.password.dto';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { CreateOtpDto } from '../otps/dto/create-otp.dto';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiProperty({
    deprecated: true,
    description: 'used to singup new user',
  })
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() body: SignupDto): Promise<any> {
    const { data, message } = await this.authService.signUp(body);

    return {
      success: true,
      message,
      data: {
        ...data,
        password: null,
        refreshToken: null,
        accessToken: null,
      },
    };
  }

  @ApiProperty({
    deprecated: true,
    description: 'used to login user',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const { tokens, message } = await this.authService.login(body);
    res.cookie('accessToken', tokens.accessToken, {
      secure: true,
      httpOnly: false,
      sameSite: 'lax',
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
    });
    return {
      success: true,
      message,
      tokens,
    };
  }

  @ApiProperty({
    deprecated: true,
    description: 'used to logout a user',
  })
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async logout(
    @GetUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const loggedIn = await this.authService.logout(user.id);
    if (loggedIn) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return { success: true, message: 'logout successfully' };
    }
  }
  @ApiProperty({
    deprecated: true,
    description: 'used to request a refresh token',
  })
  @Post('refresh')
  @UseGuards(AuthGuard('refresh'))
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @GetUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    console.log(user);
    const { tokens, message } = await this.authService.refreshToken(
      user.id,
      user.name,
      user.verified,
    );
    res.cookie('accessToken', tokens.accessToken, {
      secure: true,
      httpOnly: false,
      sameSite: 'lax',
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      secure: true,
      httpOnly: false,
      sameSite: 'lax',
    });
    return { success: true, message };
  }
  @ApiProperty({
    deprecated: true,
    description: 'used to verify account',
  })
  @Post('verify/')
  async verifyEmail(@Body() body: CreateOtpDto): Promise<any> {
    return await this.authService.verifyEmail(body);
  }

  @ApiProperty({
    deprecated: true,
    description: 'used to request a reset password link',
  })
  @Post('forgot-password')
  async forgotPassword(@Body() data: ForgotPasswordDto): Promise<any> {
    return await this.authService.forgotPassword(data.email);
  }

  @ApiProperty({
    deprecated: true,
    description: 'used to create a new password ',
  })
  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() data: ResetPasswordDto,
  ): Promise<any> {
    return await this.authService.resetPassword(data, token);
  }
}
