import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { OrderStatus } from '../../shared/enums/Order.status';
import { IsNotEmpty } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsNotEmpty()
  @ApiProperty()
  status: OrderStatus;
}
