import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator'
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, type Relation, Unique } from 'typeorm'
import { Project } from '../project/project.entity'
import { User } from '../user/entities/user.entity'

export enum MemberType {
  HOST = 'HOST',
  MEMBER = 'MEMBER'
}

@Unique(['projectId', 'userId'])
@Entity({ name: 'ProjectMember' })
export class ProjectMember {
  @IsInt()
  @ApiProperty({ type: 'integer' })
  @PrimaryGeneratedColumn()
  id: number

  @IsInt()
  @ApiProperty({ type: 'integer', description: '프로젝트 ID' })
  @Column()
  projectId: number

  @ApiHideProperty()
  @ManyToOne(() => Project, (p) => p.members, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  project: Relation<Project>

  @IsInt()
  @ApiProperty({ type: 'integer', description: '멤버 userId' })
  @Column()
  userId: number

  @ApiHideProperty()
  @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user: Relation<User>

  @IsEnum(MemberType)
  @ApiProperty({ enum: MemberType, description: '멤버 유형 (HOST / MEMBER)' })
  @Column({ type: 'enum', enum: MemberType, default: MemberType.MEMBER })
  memberType: MemberType

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({ maxLength: 50, description: '담당 포지션', required: false, nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  position?: string

  @ApiProperty({ description: '참여일' })
  @CreateDateColumn()
  joinedAt: Date

  constructor(partial: Partial<ProjectMember>) {
    Object.assign(this, partial)
  }
}
