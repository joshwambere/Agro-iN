import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { RuleService } from '../rule/rule.service';
import { Rule } from "../rule/entities/rule.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, Rule])],
  controllers: [OrderController],
  providers: [OrderService, RuleService],
})
export class OrderModule {}
