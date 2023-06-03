import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Rule } from './entities/rule.entity';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { ProductType } from '../shared/enums/Product.type';

@Injectable()
export class RuleService {
  constructor(
    @InjectRepository(Rule) private ruleRepository: Repository<Rule>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}
  async create(createRuleDto: CreateRuleDto) {
    const { seedPerAcre, fertilizerPerAcre, seedType, fertilizerType } =
      createRuleDto;

    if (seedType) {
      if (!seedPerAcre)
        throw new BadRequestException(
          'Seed per acre is required id seed type is provided',
        );
      const seed = await this.productRepository.findOne({
        where: { id: seedType, type: ProductType.SEED },
      });

      const fertilizer = await this.productRepository.findOne({
        where: { id: fertilizerType, type: ProductType.FERTILIZER },
      });

      if (!seed || !fertilizer)
        throw new BadRequestException('Seed or fertilizer type not found');

      const rule = this.ruleRepository.create({
        seedType: seed,
        seedPerAcre,
        fertilizerType: fertilizer,
        fertilizerPerAcre,
      });
      return await this.ruleRepository.save(rule);
    }

    const product = await this.productRepository.findOne({
      where: { id: fertilizerType },
    });
    if (!product) throw new BadRequestException('Fertilizer type not found');
    const rule = this.ruleRepository.create({
      fertilizerType: product,
      fertilizerPerAcre,
    });
    return await this.ruleRepository.save(rule);
  }

  async findOneBySeedType(seedType: Product): Promise<Rule | false> {
    const rule = await this.ruleRepository
      .createQueryBuilder('rule')
      .innerJoinAndSelect('rule.seedType', 'seedType')
      .where('seedType.id = :id', { id: seedType.id })
      .getOne();
    if (!rule) return false;
    return rule;
  }

  async findOneByFertilizerType(product: Product): Promise<Rule | false> {
    const rule = await this.ruleRepository
      .createQueryBuilder('rule')
      .innerJoin('rule.seedType', 'seedType')
      .where('seedType.id = :id', { id: product.id })
      .getOne();

    if (!rule) return false;
    return await this.ruleRepository.findOne({
      where: { id: rule.id },
      relations: ['seedType', 'fertilizerType'],
    });
  }

  async findAll(): Promise<Rule[]> {
    return await this.ruleRepository.find({
      relations: ['seedType', 'fertilizerType'],
    });
  }

  async findOne(id: string): Promise<Rule> {
    const rule = await this.ruleRepository.findOne({
      where: { id },
      relations: ['seedType', 'fertilizerType'],
    });
    if (!rule) throw new BadRequestException('Rule not found');
    return rule;
  }

  async update(id: string, updateRuleDto: UpdateRuleDto) {
    const rule = await this.findOne(id);
    const { seedPerAcre, fertilizerPerAcre, seedType, fertilizerType } =
      updateRuleDto;
    if (seedType) {
      if (!seedPerAcre)
        throw new BadRequestException(
          'Seed per acre is required id seed type is provided',
        );
      const seed = await this.productRepository.findOne({
        where: { id: seedType },
      });
      const fertilizer = await this.productRepository.findOne({
        where: { id: fertilizerType },
      });
      const data = {
        seedType: seed,
        seedPerAcre,
        fertilizerType: fertilizer,
        fertilizerPerAcre,
      };
      return await this.ruleRepository.save({
        ...rule,
        data,
      });
    }

    return await this.ruleRepository.save({
      ...rule,
      updateRuleDto,
    });
  }

  async remove(id: string): Promise<boolean> {
    const rule = await this.findOne(id);
    if (!rule) throw new BadRequestException('Rule not found');
    const deleted = await this.ruleRepository.save({
      ...rule,
      isDeleted: true,
    });
    return !!deleted;
  }
}
