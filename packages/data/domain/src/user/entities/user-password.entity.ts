import { IsNumber, IsString } from 'class-validator'
import { User } from './user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  type Relation,
  UpdateDateColumn
} from 'typeorm'

@Entity({ name: 'UserPassword' })
export class UserPassword {
  @IsNumber()
  @PrimaryColumn({ type: 'int' })
  userId: number

  @OneToOne(() => User, (user) => user.password, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>

  @IsString()
  @Column({ type: 'varchar', length: 255 })
  hashedPassword: string

  @IsString()
  @Column({ type: 'varchar', length: 255 })
  salt: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  constructor(partial: Partial<UserPassword>) {
    Object.assign(this, partial)
  }
}
