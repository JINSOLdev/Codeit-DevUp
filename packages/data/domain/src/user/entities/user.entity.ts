import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import { IsArray, IsDate, IsEmail, IsEnum, IsInt, IsOptional, IsString, IsUrl } from 'class-validator'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn
} from 'typeorm'
import { UserPassword } from './user-password.entity'
import { UserAccount } from './user-account.entity'
import { UserSetting } from './user-setting.entity'
import { JobLabel, Skill } from '../user.type'

@Entity({ name: 'User' })
export class User {
  @IsInt()
  @ApiProperty({ title: 'ID', format: 'int64' })
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty({ format: 'email', title: '이메일' })
  @IsEmail()
  @Column({ type: 'varchar', length: 300, unique: true })
  email: string

  @ApiProperty({ title: '닉네임' })
  @IsString()
  @Column({ type: 'varchar', length: 30, unique: true })
  nickname: string

  @ApiProperty({ title: '직무 라벨', enum: JobLabel, required: false, nullable: true })
  @IsOptional()
  @IsEnum(JobLabel)
  @Column({ type: 'enum', enum: JobLabel, nullable: true })
  jobLabel?: JobLabel

  @ApiProperty({ title: '소개', required: false, nullable: true })
  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  bio?: string

  @ApiProperty({ title: '프로필 이미지', required: false, nullable: true })
  @IsOptional()
  @IsUrl()
  @Column({ type: 'varchar', nullable: true })
  profileImageUrl?: string

  @ApiProperty({ title: '기술 스택', enum: Skill, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(Skill, { each: true })
  @Column('text', { array: true, default: [] })
  skills: Skill[]

  @ApiProperty({ title: 'GitHub 링크', required: false, nullable: true })
  @IsOptional()
  @IsUrl()
  @Column({ type: 'varchar', length: 500, nullable: true })
  githubLink?: string

  @ApiProperty({ title: '블로그 링크', required: false, nullable: true })
  @IsOptional()
  @IsUrl()
  @Column({ type: 'varchar', length: 500, nullable: true })
  blogLink?: string

  @ApiProperty({ title: '포트폴리오 링크', required: false, nullable: true })
  @IsOptional()
  @IsUrl()
  @Column({ type: 'varchar', length: 500, nullable: true })
  portfolioLink?: string

  @IsDate()
  @CreateDateColumn()
  createdAt: Date

  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date

  @ApiHideProperty()
  @DeleteDateColumn()
  deletedAt?: Date

  @ApiHideProperty()
  @OneToOne(() => UserPassword, (data) => data.user, { cascade: true })
  password?: Relation<UserPassword>

  @ApiHideProperty()
  @OneToMany(() => UserAccount, (data) => data.user, { cascade: true })
  accounts: Relation<UserAccount>[]

  @ApiHideProperty()
  @OneToOne(() => UserSetting, (data) => data.user, { cascade: true })
  setting?: Relation<UserSetting>

  constructor(partial: Partial<User>) {
    Object.assign(this, partial)
  }
}
