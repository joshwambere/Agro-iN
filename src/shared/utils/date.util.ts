import { BadRequestException } from '@nestjs/common';

export const parseDate = (d: string): Date => {
  if (d !== '' && !/^(\d{4})-(\d{2})-(\d{2})$/.test(d))
    throw new BadRequestException(
      'Date must be a date format (2020-01-01)',
    );
  return d === '' ? null : new Date(d);
};
