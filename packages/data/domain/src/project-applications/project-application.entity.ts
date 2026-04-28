import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsDate, IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn
} from 'typeorm'
import { Project } from '../project/project.entity'
import { Position } from '../project/project.types'
import { User } from '../user/entities/user.entity'

export enum ApplicationStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected'
}

export enum RejectionCategory {
  position_limit = 'position_limit',
  condition_not_met = 'condition_not_met',
  internal_standard = 'internal_standard',
  custom = 'custom'
}

@Entity({ name: 'ProjectApplication' })
export class ProjectApplication {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number

  @IsInt()
  @ApiProperty({ type: 'integer', description: '프로젝트 ID' })
  @Column()
  projectId: number

  @ApiHideProperty()
  @ManyToOne(() => Project, (p) => p.applications, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  project: Relation<Project>

  @IsInt()
  @ApiProperty({ type: 'integer', description: '신청자 userId' })
  @Column()
  userId: number

  @ApiHideProperty()
  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: Relation<User>

  @IsEnum(Position)
  @ApiProperty({ enum: Position, description: '희망 포지션' })
  @Column({ type: 'enum', enum: Position })
  position: Position

  @IsString()
  @ApiProperty({ description: '지원 사유' })
  @Column({ type: 'text' })
  motivation: string

  @IsEnum(ApplicationStatus)
  @ApiProperty({ enum: ApplicationStatus, description: '신청 상태', default: ApplicationStatus.pending })
  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.pending })
  status: ApplicationStatus

  @IsOptional()
  @IsEnum(RejectionCategory)
  @ApiProperty({
    enum: RejectionCategory,
    description:
      '거절 유형 (position_limit: 인원제한, condition_not_met: 모집조건 불충족, internal_standard: 내부기준, custom: 직접입력)',
    required: false,
    nullable: true
  })
  @Column({ type: 'enum', enum: RejectionCategory, nullable: true })
  rejectionType?: RejectionCategory

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiProperty({ maxLength: 500, description: '거절 상세 텍스트', required: false, nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  rejectionText?: string

  @IsDate()
  @ApiProperty({ description: '신청일' })
  @CreateDateColumn()
  createdAt: Date

  @ApiHideProperty()
  @UpdateDateColumn()
  updatedAt: Date

  constructor(partial: Partial<ProjectApplication>) {
    Object.assign(this, partial)
  }
}
