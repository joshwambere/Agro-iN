import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  CreateOrderDto,
  SaveFertilizerOrderDto,
  SaveOrderDto,
} from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: SaveOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @ApiProperty({
    type: CreateOrderDto,
    description: 'Calculate resources for order',
  })
  @Post('/calculate')
  CalculateResources(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.CalculateSeedAmount(createOrderDto);
  }

  @ApiProperty({
    type: SaveFertilizerOrderDto,
    description: 'Calculate resources for order',
  })
  @Post('/calculateFertilizer')
  CalculateFertilizerResources(@Body() createOrderDto: SaveFertilizerOrderDto) {
    return this.orderService.CalculateFertilizerAmount(createOrderDto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
