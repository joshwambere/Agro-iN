import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { OrderStatus } from '../../shared/enums/Order.status';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    nullable: false,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;
  @Column({ nullable: false, unique: false })
  quantity: number;
  @Column({ nullable: false, unique: false })
  shippingAddress: string;
  @Column({ nullable: false, unique: false })
  totalPrice: number;
  @ManyToMany(() => Product)
  @JoinTable({ name: 'order_product' })
  products: Product[];
  @ManyToOne(() => User)
  @Column({ nullable: false, unique: false, default: false, type: 'boolean' })
  isDeleted: boolean;
  user: User;
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
