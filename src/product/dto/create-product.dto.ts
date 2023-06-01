import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductType } from '../../shared/enums/Product.type';

export class CreateProductDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string;
  @IsNotEmpty()
  @Min(0)
  @IsNumber()
  @ApiProperty()
  price: number;
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty()
  quantity: number;
  @IsNotEmpty()
  @IsEnum(ProductType)
  @ApiProperty({ enum: ProductType })
  type: ProductType;
}
