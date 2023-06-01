import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOtpDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @MinLength(4)
  @MaxLength(4)
  otp: string;
}
