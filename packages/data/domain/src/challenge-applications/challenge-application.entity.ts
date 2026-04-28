import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsDate, IsEnum, IsInt, IsOptional, IsString, IsUrl, MaxLength, IsNumber } from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn
} from 'typeorm'
import { Challenge } from '../challenge/challenge.entity'
import { User } from '../user/entities/user.entity'

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum RejectionCategory {
  SKILL_MISMATCH = 'SKILL_MISMATCH',
  POSITION_FULL = 'POSITION_FULL',
  SCHEDULE_CONFLICT = 'SCHEDULE_CONFLICT',
  OTHER = 'OTHER'
}

@Entity({ name: 'ChallengeApplication' })
export class ChallengeApplication {
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
  @ManyToOne(() => Challenge, (c) => c.applications, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  challenge: Relation<Challenge>

  @IsNumber()
  @IsInt()
  @ApiProperty({ type: 'integer', description: '신청자 userId' })
  @Column()
  userId: number

  @ApiHideProperty()
  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: Relation<User>

  @IsString()
  @MaxLength(100)
  @ApiProperty({ maxLength: 100, description: '신청자 이름' })
  @Column({ type: 'varchar', length: 100 })
  name: string

  @IsOptional()
  @IsUrl()
  @MaxLength(300)
  @ApiProperty({ maxLength: 300, description: 'GitHub URL', required: false, nullable: true })
  @Column({ type: 'varchar', length: 300, nullable: true })
  githubUrl?: string

  @IsString()
  @ApiProperty({ description: '지원 동기' })
  @Column({ type: 'text' })
  motivation: string

  @IsEnum(ApplicationStatus)
  @ApiProperty({ enum: ApplicationStatus, description: '신청 상태', default: ApplicationStatus.PENDING })
  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  status: ApplicationStatus

  @IsOptional()
  @IsEnum(RejectionCategory)
  @ApiProperty({ enum: RejectionCategory, description: '거절 사유 카테고리', required: false, nullable: true })
  @Column({ type: 'enum', enum: RejectionCategory, nullable: true })
  reasonCategory?: RejectionCategory

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiProperty({ maxLength: 500, description: '거절 상세 사유', required: false, nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  reasonDetail?: string

  @IsDate()
  @ApiProperty({ description: '신청일' })
  @CreateDateColumn()
  createdAt: Date

  @ApiHideProperty()
  @UpdateDateColumn()
  updatedAt: Date

  constructor(partial: Partial<ChallengeApplication>) {
    Object.assign(this, partial)
  }
}
