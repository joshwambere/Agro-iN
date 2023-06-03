import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderResponseInterface } from '../../shared/interfaces/order.response.interface';
import { ProductType } from '../../shared/enums/Product.type';

export class CreateOrderDto {
  @IsNotEmpty()
  @ApiProperty()
  landSize: number;
  @IsNotEmpty()
  @ApiProperty()
  seedName: string;
  @IsNotEmpty()
  @ApiProperty()
  productType: ProductType;
}

export class SaveOrderDto {
  @IsNotEmpty()
  @ApiProperty()
  orderDetails: OrderResponseInterface;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  shippingAddress: string;
}

export class SaveFertilizerOrderDto {
  @IsNotEmpty()
  @ApiProperty()
  landSize: number;
  @IsNotEmpty()
  @ApiProperty()
  seedType: string;
  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(ProductType)
  productType: ProductType;
}
