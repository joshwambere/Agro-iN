import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity('rules')
export class Rule {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ManyToOne(() => Product, { cascade: true })
  seedType: Product;
  @ManyToOne(() => Product, { cascade: true })
  fertilizerType: Product;
  @Column({ nullable: true })
  seedPerAcre: number;
  @Column({ nullable: true })
  fertilizerPerAcre: number;
}
