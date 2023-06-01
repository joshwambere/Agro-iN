import { applyDecorators } from '@nestjs/common';
import { ApiPropertyOptional, ApiPropertyOptions } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export function OptionalProperty(options?: ApiPropertyOptions) {
  return applyDecorators(ApiPropertyOptional(options), IsOptional());
}
