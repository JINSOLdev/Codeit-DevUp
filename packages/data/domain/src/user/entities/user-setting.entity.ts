import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsDate, IsOptional, IsNumber } from 'class-validator'
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, type Relation, UpdateDateColumn } from 'typeorm'
import { User } from './user.entity'

@Entity({ name: 'UserSetting' })
export class UserSetting {
  @ApiHideProperty()
  @IsNumber()
  @PrimaryColumn({ type: 'int' })
  userId: number

  @ApiHideProperty()
  @OneToOne(() => User, (user) => user.setting, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>

  @IsBoolean()
  @ApiProperty({ description: '마케팅 활용 동의 여부' })
  @Column()
  agreeMarketing: boolean

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: '마케팅 활용 동의 - 핸드폰' })
  @Column({ nullable: true })
  agreeMarketingPhone?: boolean

  @IsOptional()
  @IsDate()
  @ApiProperty({ description: '마케팅 활용 동의 - 핸드폰 동의 일시' })
  @Column({ nullable: true })
  agreeMarketingPhoneAt?: Date

  @IsOptional()
  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date

  constructor(partial: Partial<UserSetting>) {
    Object.assign(this, partial)
  }
}
