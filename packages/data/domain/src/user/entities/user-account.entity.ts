import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation, Unique } from 'typeorm'
import { IsNumber, IsString, IsEnum } from 'class-validator'
import { User } from './user.entity'
import { UserAccountType } from '../user.type'

@Unique(['type', 'accountId'])
@Entity({ name: 'UserAccount' })
export class UserAccount {
  @IsNumber()
  @PrimaryGeneratedColumn()
  id: number

  @IsNumber()
  @Column({ type: 'int' })
  userId: number

  @ManyToOne(() => User, (user) => user.accounts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  user: Relation<User>

  @IsEnum(UserAccountType)
  @Column({ type: 'enum', enum: UserAccountType })
  type: UserAccountType

  @IsString()
  @Column({ type: 'varchar', length: 100 })
  accountId: string

  constructor(partial: Partial<UserAccount>) {
    Object.assign(this, partial)
  }
}
