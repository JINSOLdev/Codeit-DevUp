import { IsArray, IsDate, IsEnum, IsInt, IsOptional, IsString, Length, MaxLength } from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Challenge } from '../challenge/challenge.entity'
import { User } from '../user/entities/user.entity'

export enum ChallengeVerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

@Entity({ name: 'ChallengeVerification' })
export class ChallengeVerification {
  @IsInt()
  @PrimaryGeneratedColumn()
  id: number

  @IsInt()
  @Column()
  challengeId: number

  @ManyToOne(() => Challenge, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challengeId' })
  challenge: Challenge

  @IsInt()
  @Column()
  userId: number

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User

  @IsString()
  @Length(1, 100)
  @Column({ length: 100 })
  title: string

  @IsString()
  @MaxLength(1000)
  @Column({ length: 1000 })
  content: string

  @IsArray()
  @IsString({ each: true })
  @Column('text', { array: true, nullable: true })
  imageUrls?: string[]

  @IsEnum(ChallengeVerificationStatus)
  @Column({ type: 'enum', enum: ChallengeVerificationStatus, default: ChallengeVerificationStatus.PENDING })
  status: ChallengeVerificationStatus

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Column({ length: 500, nullable: true })
  rejectionReason?: string

  @IsDate()
  @CreateDateColumn()
  createdAt: Date

  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date

  constructor(partial: Partial<ChallengeVerification>) {
    Object.assign(this, partial)
  }
}
