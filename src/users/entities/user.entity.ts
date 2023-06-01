import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../shared/enums/User.role';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: false, unique: false, type: 'varchar' })
  name: string;
  @Column({ nullable: false, unique: true, type: 'varchar' })
  email: string;
  @Column({ type: 'varchar' })
  password: string;
  @Column({ nullable: true, unique: false, type: 'varchar' })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.FARMER,
  })
  role: UserRole;
  @Column({ nullable: true, unique: false, type: 'varchar' })
  shippingAddress: string;

  @Column({ nullable: true, unique: false, type: 'varchar' })
  refreshToken: string;
  @Column({ nullable: true, unique: false, type: 'varchar' })
  accessToken: string;
  @Column({ nullable: true })
  verified: boolean;
  @Column({ nullable: false, default: false })
  isDeleted: boolean;
  createdAt: Date;
  @UpdateDateColumn({
    type: 'timestamptz',
    onUpdate: 'NOW()',
  })
  updatedAt: Date;
}
