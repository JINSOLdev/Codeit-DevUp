import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsDate, IsInt } from 'class-validator'
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation, Unique } from 'typeorm'
import { Project } from '../project/project.entity'
import { User } from '../user/entities/user.entity'

@Unique(['projectId', 'userId'])
@Entity({ name: 'ProjectLiked' })
export class ProjectLiked {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number

  @IsInt()
  @ApiProperty({ type: 'integer', description: '프로젝트 ID' })
  @Column()
  projectId: number

  @ApiHideProperty()
  @ManyToOne(() => Project, (p) => p.likes, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  project: Relation<Project>

  @IsInt()
  @ApiProperty({ type: 'integer', description: '사용자 userId' })
  @Column()
  userId: number

  @ApiHideProperty()
  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: Relation<User>

  @IsDate()
  @ApiProperty({ description: '찜한 날짜' })
  @CreateDateColumn()
  createdAt: Date

  constructor(partial: Partial<ProjectLiked>) {
    Object.assign(this, partial)
  }
}
