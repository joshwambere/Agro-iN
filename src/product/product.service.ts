import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductType } from '../shared/enums/Product.type';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  async create(createProductDto: CreateProductDto) {
    const { name, price, quantity, type } = createProductDto;
    const exist = await this.checkProductExist(name, type);

    if (exist) throw new BadRequestException('Product already exist');

    const product = this.productRepository.create({
      name,
      price,
      quantity,
      type,
    });

    await this.productRepository.save(product);
    return product;
  }

  async checkProductExist(name: string, type: ProductType): Promise<boolean> {
    const product = await this.productRepository.findOne({
      where: { name, type },
    });
    return !!product;
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({ where: { isDeleted: false } });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    return await this.productRepository.save({
      ...product,
      ...updateProductDto,
    });
  }

  async remove(id: string): Promise<boolean> {
    const product = await this.findOne(id);
    await this.productRepository.save({
      ...product,
      isDeleted: true,
    });
    return true;
  }
}
