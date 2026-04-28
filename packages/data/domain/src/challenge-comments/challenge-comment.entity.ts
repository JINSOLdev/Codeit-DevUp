import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsDate, IsInt, IsOptional, IsString, IsNumber } from 'class-validator'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn
} from 'typeorm'
import { Challenge } from '../challenge/challenge.entity'
import { User } from '../user/entities/user.entity'

@Entity({ name: 'ChallengeComment' })
export class ChallengeComment {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number

  @IsNumber()
  @IsInt()
  @ApiProperty({ type: 'integer', description: '챌린지 ID' })
  @Column()
  challengeId: number

  @ApiHideProperty()
  @ManyToOne(() => Challenge, (c) => c.comments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  challenge: Relation<Challenge>
  @IsNumber()
  @IsInt()
  @ApiProperty({ type: 'integer', description: '작성자 userId' })
  @Column()
  userId: number

  @ApiHideProperty()
  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: Relation<User>

  @IsString()
  @ApiProperty({ description: '댓글 내용' })
  @Column({ type: 'text' })
  content: string

  @IsDate()
  @ApiProperty({ description: '작성일' })
  @CreateDateColumn()
  createdAt: Date

  @ApiHideProperty()
  @UpdateDateColumn()
  updatedAt: Date

  @IsOptional()
  @ApiHideProperty()
  @DeleteDateColumn()
  deletedAt?: Date

  constructor(partial: Partial<ChallengeComment>) {
    Object.assign(this, partial)
  }
}
