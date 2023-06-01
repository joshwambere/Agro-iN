import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity('otp')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('varchar')
  otp: string;
  @Column({ name: 'user_id' })
  userId: string;
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user_id: User;
  @Column({ type: 'boolean', default: true })
  isValid: boolean;
  @Column('timestamptz')
  expiresAt: Date;
}
