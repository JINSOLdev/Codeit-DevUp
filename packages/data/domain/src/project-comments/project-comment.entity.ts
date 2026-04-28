import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsDate, IsInt, IsOptional, IsString } from 'class-validator'
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
import { Project } from '../project/project.entity'
import { User } from '../user/entities/user.entity'

@Entity({ name: 'ProjectComment' })
export class ProjectComment {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number

  @IsInt()
  @ApiProperty({ type: 'integer', description: '프로젝트 ID' })
  @Column()
  projectId: number

  @ApiHideProperty()
  @ManyToOne(() => Project, (p) => p.comments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  project: Relation<Project>

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

  constructor(partial: Partial<ProjectComment>) {
    Object.assign(this, partial)
  }
}
