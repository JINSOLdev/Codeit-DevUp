import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDateString, IsEnum, IsInt, IsString, MaxLength, Min } from 'class-validator'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn
} from 'typeorm'
import { User } from '../user/entities/user.entity'
import { ProjectApplication } from '../project-applications/project-application.entity'
import { ProjectComment } from '../project-comments/project-comment.entity'
import { ProjectLiked } from '../project-liked/project-liked.entity'
import { ProjectMember } from '../project-member/project-member.entity'
import { ContactMethod, Position, ProjectStatus, ProjectType, TechStack } from './project.types'

export { ContactMethod, Position, ProjectStatus, ProjectType, TechStack }

@Entity({ name: 'Project' })
export class Project {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number

  @IsInt()
  @ApiProperty({ type: 'integer', description: '프로젝트 호스트 userId' })
  @Column()
  hostId: number

  @ApiHideProperty()
  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'hostId' })
  host: Relation<User>

  @IsString()
  @MaxLength(200)
  @ApiProperty({ maxLength: 200, description: '프로젝트 제목' })
  @Column({ type: 'varchar', length: 200 })
  title: string

  @IsString()
  @ApiProperty({ description: '프로젝트 설명' })
  @Column({ type: 'text' })
  description: string

  @IsEnum(ProjectType)
  @ApiProperty({ enum: ProjectType, enumName: 'ProjectType', description: '프로젝트 유형' })
  @Column({ type: 'enum', enum: ProjectType })
  projectType: ProjectType

  @IsArray()
  @IsEnum(TechStack, { each: true })
  @ApiProperty({ enum: TechStack, enumName: 'TechStack', isArray: true })
  @Column('text', { array: true, default: [] })
  techStacks: TechStack[]

  @IsArray()
  @IsEnum(Position, { each: true })
  @ApiProperty({ enum: Position, enumName: 'Position', isArray: true, description: '모집 포지션' })
  @Column('text', { array: true, default: [] })
  positions: Position[]

  @IsInt()
  @Min(1)
  @ApiProperty({ type: 'integer', minimum: 1, description: '총 모집 인원' })
  @Column({ type: 'int' })
  maxMembers: number

  @IsDateString()
  @ApiProperty({ description: '모집 마감일 (YYYY-MM-DD)', example: '2026-03-20' })
  @Column({ type: 'date' })
  recruitEndDate: string

  @IsDateString()
  @ApiProperty({ description: '프로젝트 시작일 (YYYY-MM-DD)', example: '2026-03-21' })
  @Column({ type: 'date' })
  projectStartDate: string

  @IsDateString()
  @ApiProperty({ description: '프로젝트 종료일 (YYYY-MM-DD)', example: '2026-05-01' })
  @Column({ type: 'date' })
  projectEndDate: string

  @IsEnum(ContactMethod)
  @ApiProperty({ enum: ContactMethod, enumName: 'ContactMethod', description: '연락 방법' })
  @Column({ type: 'enum', enum: ContactMethod })
  contactMethod: ContactMethod

  @IsString()
  @MaxLength(500)
  @ApiProperty({ maxLength: 500, description: '연락 링크' })
  @Column({ type: 'varchar', length: 500 })
  contactLink: string

  @IsEnum(ProjectStatus)
  @ApiProperty({ enum: ProjectStatus, enumName: 'ProjectStatus', description: '프로젝트 상태' })
  @Column({ type: 'enum', enum: ProjectStatus, default: ProjectStatus.recruiting })
  status: ProjectStatus

  @IsInt()
  @ApiProperty({ type: 'integer', description: '조회수', default: 0 })
  @Column({ type: 'int', default: 0 })
  viewCount: number

  @ApiHideProperty()
  @CreateDateColumn()
  createdAt: Date

  @ApiHideProperty()
  @UpdateDateColumn()
  updatedAt: Date

  @ApiHideProperty()
  @OneToMany(() => ProjectApplication, (a) => a.project)
  applications: Relation<ProjectApplication>[]

  @ApiHideProperty()
  @OneToMany(() => ProjectComment, (c) => c.project)
  comments: Relation<ProjectComment>[]

  @ApiHideProperty()
  @OneToMany(() => ProjectLiked, (l) => l.project)
  likes: Relation<ProjectLiked>[]

  @ApiHideProperty()
  @OneToMany(() => ProjectMember, (m) => m.project)
  members: Relation<ProjectMember>[]

  constructor(partial: Partial<Project>) {
    Object.assign(this, partial)
  }
}
