import { Module } from '@nestjs/common';
import { RuleService } from './rule.service';
import { RuleController } from './rule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rule } from './entities/rule.entity';
import { User } from '../users/entities/user.entity';
import { Product } from "../product/entities/product.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Rule, User, Product])],
  controllers: [RuleController],
  providers: [RuleService],
})
export class RuleModule {}
