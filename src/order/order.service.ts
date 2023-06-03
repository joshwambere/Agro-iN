import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateOrderDto,
  SaveFertilizerOrderDto,
  SaveOrderDto,
} from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { RuleService } from '../rule/rule.service';
import { ProductType } from '../shared/enums/Product.type';
import { OrderResponseInterface } from '../shared/interfaces/order.response.interface';
import { Rule } from '../rule/entities/rule.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private readonly ruleService: RuleService,
  ) {}
  async create(saveOrderDto: SaveOrderDto) {
    const { orderDetails, shippingAddress } = saveOrderDto;
    const rule = await this.ruleService.findOne(orderDetails.rule);
    if (!rule) throw new BadRequestException('Product not found');

    // Check if the product mentioned in the orderDetails is available
    const isAvailable = await this.checkStockAvailability(orderDetails, rule);
    if (!isAvailable) throw new BadRequestException('Product out of stock');

    // Create order
    const productsToSave = [];
    if (orderDetails.productType === rule.seedType?.name) {
      productsToSave.push(rule.seedType);
    } else if (orderDetails.productType === rule.fertilizerType?.name) {
      productsToSave.push(rule.fertilizerType);
    } else {
      throw new BadRequestException('Invalid product type');
    }

    const order = this.orderRepository.create({
      quantity: orderDetails.QuantityInKg,
      totalPrice: orderDetails.totalCost,
      shippingAddress,
      products: productsToSave,
    });

    // Update product quantity
    await this.updateStock(orderDetails, rule);

    return await this.orderRepository.save(order);
  }

  async checkStockAvailability(
    orderDetails: OrderResponseInterface,
    rule: Rule,
  ): Promise<boolean> {
    const { fertilizerType, seedType } = rule;

    if (!rule) return false;

    if (orderDetails.productType === fertilizerType?.name) {
      return fertilizerType.quantity >= orderDetails.QuantityInKg;
    } else if (orderDetails.productType === seedType?.name) {
      return seedType.quantity >= orderDetails.QuantityInKg;
    }

    return false;
  }
  async updateStock(orderDetails: OrderResponseInterface, rule: Rule) {
    const { fertilizerType, seedType } = rule;

    if (!rule) return false;
    if (!fertilizerType) {
      rule.seedType.quantity -= orderDetails.QuantityInKg;
    }

    rule.fertilizerType.quantity -= orderDetails.QuantityInKg;

    if (seedType && seedType.name === orderDetails.productType) {
      // Update the product using seedType
      return await this.productRepository.save({
        ...seedType,
      });
    } else if (
      fertilizerType &&
      fertilizerType.name === orderDetails.productType
    ) {
      // Update the product using fertilizerType
      return await this.productRepository.save({
        ...fertilizerType,
      });
    }
  }

  async CalculateSeedAmount(
    createOrderDto: CreateOrderDto,
  ): Promise<OrderResponseInterface> {
    const { landSize, seedName, productType } = createOrderDto;
    // Check if product type is seed
    if (productType !== ProductType.SEED)
      throw new BadRequestException('Invalid product type');

    // Check if land size is valid
    if (landSize <= 0) throw new BadRequestException('Invalid land size');

    const product = await this.productRepository.findOne({
      where: { name: seedName },
    });
    if (!product)
      throw new NotFoundException('Sorry, seed not found at the moment');

    const seedRule: Rule | boolean = await this.ruleService.findOneBySeedType(
      product,
    );

    if (!seedRule)
      throw new InternalServerErrorException('Something went wrong');

    // Calculate seed amount and total price
    return {
      totalCost: seedRule.seedPerAcre * landSize * product.price,
      productType: seedName,
      QuantityInKg: seedRule.seedPerAcre * landSize,
      rule: seedRule.id,
    };
  }

  async CalculateFertilizerAmount(
    createOrderDto: SaveFertilizerOrderDto,
  ): Promise<OrderResponseInterface> {
    const { landSize, productType, seedType } = createOrderDto;
    // Check if product type is fertilizer
    if (productType !== ProductType.FERTILIZER)
      throw new BadRequestException('Invalid product type');

    // Check if land size is valid
    if (landSize <= 0) throw new BadRequestException('Invalid land size');

    // get seed product
    const seedProduct = await this.productRepository.findOne({
      where: { name: seedType, type: ProductType.SEED },
    });
    if (!seedProduct)
      throw new NotFoundException('Sorry, seed not found at the moment');

    // get fertilizer product
    const fertilizerProduct = await this.getSeedMatchingFertilizer(
      seedProduct.name,
    );

    const fertilizerRule: Rule | false =
      await this.ruleService.findOneByFertilizerType(seedProduct);

    if (!fertilizerRule)
      throw new InternalServerErrorException('Something went wrong');

    return {
      totalCost:
        fertilizerProduct.price * (fertilizerRule.fertilizerPerAcre * landSize),
      productType: fertilizerProduct.name,
      QuantityInKg: fertilizerRule.fertilizerPerAcre * landSize,
      rule: fertilizerRule.id,
    };
  }

  async getSeedMatchingFertilizer(seedName: string) {
    const product = await this.productRepository.findOne({
      where: { name: seedName },
    });
    if (!product)
      throw new NotFoundException('Sorry, seed not found at the moment');

    // get fertilizer that matches seed in rules
    const seedRule: Rule | boolean =
      await this.ruleService.findOneByFertilizerType(product);

    if (!seedRule)
      throw new InternalServerErrorException('Something went wrong');

    return await this.productRepository.findOne({
      where: { id: seedRule.fertilizerType.id },
    });
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['products'],
    });
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['products'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);

    return await this.orderRepository.save({
      ...order,
      ...updateOrderDto,
    });
  }

  async remove(id: string): Promise<boolean> {
    const order = await this.findOne(id);
    return !!(await this.orderRepository.save({
      ...order,
      isDeleted: true,
    }));
  }
}
