import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested
} from 'class-validator'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn
} from 'typeorm'
import { User } from '../user/entities/user.entity'
import { ChallengeApplication } from '../challenge-applications/challenge-application.entity'
import { ChallengeBookmarked } from '../challenge-bookmarked/challenge-bookmarked.entity'
import { ChallengeComment } from '../challenge-comments/challenge-comment.entity'
import { ChallengeLiked } from '../challenge-liked/challenge-liked.entity'
import { ChallengeMember } from '../challenge-member/challenge-member.entity'
import {
  ContactMethod,
  MeetingType,
  Position,
  ChallengeDifficulty,
  ChallengeStatus,
  ChallengeType,
  TechStack,
  ChallengeVerificationFrequency,
  ChallengeJoinType,
  ChallengeVerificationMethod,
  ChallengeParticipationStatus
} from './challenge.types'

export {
  ContactMethod,
  MeetingType,
  Position,
  ChallengeDifficulty,
  ChallengeStatus,
  ChallengeType,
  TechStack,
  ChallengeJoinType,
  ChallengeVerificationFrequency,
  ChallengeVerificationMethod,
  ChallengeParticipationStatus
}

export class PositionQuota {
  @IsEnum(Position)
  @ApiProperty({ enum: Position, description: '포지션' })
  position: Position

  @IsInt()
  @Min(0)
  @ApiProperty({ type: 'integer', minimum: 0, description: '모집 정원' })
  quota: number
}

@Entity({ name: 'Challenge' })
export class Challenge {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number

  @IsInt()
  @ApiProperty({ type: 'integer', description: '챌린지 호스트 userId' })
  @Column({ type: 'int' })
  hostId: number

  @ApiHideProperty()
  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'hostId' })
  host: Relation<User>

  @IsString()
  @MaxLength(100)
  @ApiProperty({ maxLength: 100, description: '챌린지 제목' })
  @Column({ type: 'varchar', length: 100 })
  title: string

  @IsString()
  @ApiProperty({ description: '챌린지 설명' })
  @Column({ type: 'text' })
  description: string

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    description: '태그 목록',
    example: ['알고리즘', '코테']
  })
  @Column('text', { array: true, default: [] })
  tags: string[]

  @IsArray()
  @IsEnum(TechStack, { each: true })
  @ApiProperty({ enum: TechStack, isArray: true })
  @Column('text', { array: true, default: [] })
  techStacks: TechStack[]

  @IsDateString()
  @ApiProperty({ description: '챌린지 시작일', example: '2026-03-15' })
  @Column({ type: 'date' })
  startDate: string

  @IsDateString()
  @ApiProperty({ description: '챌린지 종료일', example: '2026-03-31' })
  @Column({ type: 'date' })
  endDate: string

  @IsDateString()
  @ApiProperty({ description: '모집 마감일', example: '2026-03-14' })
  @Column({ type: 'date' })
  recruitDeadline: string

  @IsEnum(ChallengeVerificationFrequency)
  @ApiProperty({
    enum: ChallengeVerificationFrequency,
    description: '인증 주기'
  })
  @Column({ type: 'enum', enum: ChallengeVerificationFrequency })
  verificationFrequency: ChallengeVerificationFrequency

  @IsOptional()
  @IsEnum(ChallengeVerificationMethod)
  @ApiProperty({
    enum: ChallengeVerificationMethod,
    description: '인증 방식 (추후 구현 예정)',
    required: false
  })
  @Column({ type: 'enum', enum: ChallengeVerificationMethod, nullable: true })
  verificationMethod?: ChallengeVerificationMethod

  @IsEnum(ChallengeParticipationStatus)
  @ApiProperty({
    enum: ChallengeParticipationStatus,
    description: '챌린지 참여 상태'
  })
  @Column({ type: 'enum', enum: ChallengeParticipationStatus, default: ChallengeParticipationStatus.NONE })
  participationStatus: ChallengeParticipationStatus

  @IsInt()
  @Min(1)
  @ApiProperty({
    type: 'integer',
    minimum: 1,
    description: '최대 참여 인원'
  })
  @Column({ type: 'int' })
  maxParticipants: number

  @IsEnum(ChallengeJoinType)
  @ApiProperty({
    enum: ChallengeJoinType,
    description: '참여 방식'
  })
  @Column({ type: 'enum', enum: ChallengeJoinType })
  joinType: ChallengeJoinType

  @IsEnum(ChallengeStatus)
  @ApiProperty({
    enum: ChallengeStatus,
    description: '챌린지 상태'
  })
  @Column({
    type: 'enum',
    enum: ChallengeStatus,
    default: ChallengeStatus.RECRUITING
  })
  status: ChallengeStatus

  @IsInt()
  @ApiProperty({ type: 'integer', default: 0, description: '조회수' })
  @Column({ type: 'int', default: 0 })
  viewCount: number

  @ApiHideProperty()
  @CreateDateColumn()
  createdAt: Date

  @ApiHideProperty()
  @UpdateDateColumn()
  updatedAt: Date

  @IsOptional()
  @ApiHideProperty()
  @DeleteDateColumn()
  deletedAt?: Date

  @ApiHideProperty()
  @OneToMany(() => ChallengeApplication, (application) => application.challenge)
  applications: Relation<ChallengeApplication>[]

  @ApiHideProperty()
  @OneToMany(() => ChallengeBookmarked, (bookmark) => bookmark.challenge)
  bookmarks: Relation<ChallengeBookmarked>[]

  @ApiHideProperty()
  @OneToMany(() => ChallengeComment, (comment) => comment.challenge)
  comments: Relation<ChallengeComment>[]

  @ApiHideProperty()
  @OneToMany(() => ChallengeLiked, (like) => like.challenge)
  likes: Relation<ChallengeLiked>[]

  @ApiHideProperty()
  @OneToMany(() => ChallengeMember, (member) => member.challenge)
  members: Relation<ChallengeMember>[]

  constructor(partial: Partial<Challenge>) {
    Object.assign(this, partial)
  }
}
