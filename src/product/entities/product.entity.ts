import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductType } from '../../shared/enums/Product.type';
import { Order } from '../../order/entities/order.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: false, unique: false, type: 'varchar' })
  name: string;
  @Column({ nullable: false, unique: false, type: 'varchar' })
  @Column({
    type: 'enum',
    enum: ProductType,
    nullable: false,
  })
  type: ProductType;
  description: string;
  @Column({ nullable: false, unique: false, type: 'numeric' })
  price: number;
  @Column({ nullable: false, unique: false, type: 'numeric' })
  quantity: number;
  @Column({ nullable: false, unique: false, type: 'boolean', default: false })
  isDeleted: boolean;
  @UpdateDateColumn({
    type: 'timestamptz',
    onUpdate: 'NOW()',
  })
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamptz',
    onUpdate: 'NOW()',
  })
  updatedAt: Date;
}
