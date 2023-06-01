import { Injectable } from '@nestjs/common';
import { CreateOtpDto } from './dto/create-otp.dto';
import { UpdateOtpDto } from './dto/update-otp.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { timeStampHelper } from '../shared/helpers/timeStamp.helper';

@Injectable()
export class OtpsService {
  constructor(
    @InjectRepository(Otp) private readonly otpRepository: Repository<Otp>,
    private readonly configService: ConfigService,
  ) {}
  async create(createOtpDto: CreateOtpDto, user: User): Promise<Otp> {
    const expiresAt = timeStampHelper(this.configService.get('OTP_EXPIRES_IN'));
    const Otp = this.otpRepository.create({
      ...createOtpDto,
      expiresAt: expiresAt,
      userId: user.id,
    });
    return await this.otpRepository.save(Otp);
  }

  async delete(id: string) {
    const otp = await this.otpRepository.findOne({ where: { id } });
    if (!otp) return false;
    return await this.otpRepository.remove(otp);
  }

  findAll() {
    return `This action returns all otps`;
  }

  async findOne(id: string) {
    return await this.otpRepository.findOne({ where: { otp: id } });
  }

  update(id: number, updateOtpDto: UpdateOtpDto) {
    return `This action updates a #${id} otp`;
  }

  remove(id: number) {
    return `This action removes a #${id} otp`;
  }
}
