import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsDate, IsInt, IsNumber } from 'class-validator'
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation, Unique } from 'typeorm'
import { Challenge } from '../challenge/challenge.entity'
import { User } from '../user/entities/user.entity'

@Unique(['challengeId', 'userId'])
@Entity({ name: 'ChallengeBookmarked' })
export class ChallengeBookmarked {
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
  @ManyToOne(() => Challenge, (c) => c.bookmarks, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  challenge: Relation<Challenge>

  @IsNumber()
  @IsInt()
  @ApiProperty({ type: 'integer', description: '사용자 userId' })
  @Column()
  userId: number

  @ApiHideProperty()
  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: Relation<User>

  @IsDate()
  @ApiProperty({ description: '북마크한 날짜' })
  @CreateDateColumn()
  createdAt: Date

  constructor(partial: Partial<ChallengeBookmarked>) {
    Object.assign(this, partial)
  }
}
