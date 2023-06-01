import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SendgridService {
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(configService.get('SENDGRID_API_KEY'));
  }

  async sendEmail(mail: SendGrid.MailDataRequired) {
    return await SendGrid.send(mail);
  }
}
