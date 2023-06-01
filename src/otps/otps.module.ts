import { Module } from '@nestjs/common';
import { OtpsService } from './otps.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Otp])],
  providers: [OtpsService],
})
export class OtpsModule {}
