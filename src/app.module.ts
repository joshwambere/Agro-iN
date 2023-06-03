import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmConfigService } from './shared/configs/db/typeorm.service';
import { join } from 'path';
import { getEnvs } from './shared/configs/env/helper/env.helper';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { RuleModule } from './rule/rule.module';

const envFilePath: string | any = getEnvs(join(__dirname, '..')) || process.env;

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    UsersModule,
    AuthModule,
    ProductModule,
    OrderModule,
    RuleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
