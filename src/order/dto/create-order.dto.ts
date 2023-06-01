import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @IsNotEmpty()
  @ApiProperty()
  product: string;
  @IsNotEmpty()
  @ApiProperty()
  quantity: string[];
}
