import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  confirmEmail(email: string, template: string, subject: string) {
    return {
      to: email,
      subject: subject,
      from: {
        email: this.configService.get('SENDER_EMAIL'),
        name: 'Agro Input',
      },
      text: `Please confirm your email`,
      html: template,
    };
  }
}
