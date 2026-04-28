import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { JobLabel, Skill } from './user.type'
import { GetUserResDto } from './dto/res/get-user.res.dto'
import { PatchUserReqDto } from './dto/req/patch-user.req.dto'
import { ProjectMember } from '../project-member/project-member.entity'
import { ChallengeMember } from '../challenge-member/challenge-member.entity'
import { AwsService } from '@infra/aws'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(ProjectMember) private projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(ChallengeMember) private challengeMemberRepository: Repository<ChallengeMember>,
    private readonly awsService: AwsService
  ) {}

  async findOne(id: number): Promise<GetUserResDto> {
    const [user, projectCount, challengeCount] = await Promise.all([
      this.userRepository.findOne({ where: { id }, relations: { accounts: true } }),
      this.projectMemberRepository.countBy({ userId: id }),
      this.challengeMemberRepository.countBy({ userId: id })
    ])

    if (!user) throw new NotFoundException('not_found_user_info')

    const accountTypes = user.accounts.map((a) => a.type)

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      jobLabel: user.jobLabel,
      bio: user.bio,
      profileImageUrl: user.profileImageUrl,
      skills: user.skills,
      githubLink: user.githubLink,
      blogLink: user.blogLink,
      portfolioLink: user.portfolioLink,
      createdAt: user.createdAt,
      accounts: accountTypes,
      stats: { projectCount, challengeCount }
    }
  }

  async update(id: number, options: PatchUserReqDto): Promise<{ id: number }> {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) throw new NotFoundException('not_found_user_info')

    if (options.profileImageUrl && user.profileImageUrl && options.profileImageUrl !== user.profileImageUrl) {
      await this.awsService.deleteByUrl(user.profileImageUrl)
    }

    Object.assign(user, options)
    await this.userRepository.save(user)

    return { id: user.id }
  }

  async findByEmailOrPhone(options: { email?: string; phone?: string }) {
    if (!options.email && !options.phone) throw new BadRequestException('email_or_phone_required')
    const query = this.userRepository.createQueryBuilder('u').innerJoinAndSelect('u.accounts', 'a')
    if (options.email) query.where('u.email = :email', { email: options.email })
    if (options.phone) query.where('u.phone = :phone', { phone: options.phone })
    return query.getOne()
  }
}
