import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProjectLiked } from './project-liked.entity'
import { Project } from '../project/project.entity'
import { IdParamsDto } from '@data/dto'
import { GetLikedReqDto } from './dto/req/get-liked.req.dto'
import { GetProjectLikedResDto } from './dto/res/get-liked.res.dto'

@Injectable()
export class ProjectLikedService {
  constructor(
    @InjectRepository(ProjectLiked)
    private likedRepository: Repository<ProjectLiked>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>
  ) {}

  async like(projectId: number, userId: number): Promise<IdParamsDto> {
    const projectExists = await this.projectRepository.existsBy({ id: projectId })
    if (!projectExists) throw new NotFoundException('not_found_project_info')

    const existing = await this.likedRepository.findOne({ where: { projectId, userId } })
    if (existing) throw new ConflictException('already_liked')

    const liked = new ProjectLiked({ projectId, userId })
    try {
      await this.likedRepository.save(liked)
    } catch (e) {
      if (e?.code === '23505') throw new ConflictException('duplicate')
      throw e
    }

    return { id: liked.id }
  }

  async unlike(projectId: number, userId: number): Promise<void> {
    const liked = await this.likedRepository.findOne({ where: { projectId, userId } })
    if (!liked) throw new NotFoundException('not_found_liked_info')

    await this.likedRepository.delete({ id: liked.id })
  }

  async findAllByUser(userId: number, options: GetLikedReqDto): Promise<GetProjectLikedResDto> {
    const { sort, order, start, perPage } = options

    const query = this.likedRepository
      .createQueryBuilder('liked')
      .leftJoinAndSelect('liked.project', 'p')
      .where('liked.userId = :userId', { userId })

    if (sort && order) {
      query.orderBy(`liked.${sort}`, order as 'ASC' | 'DESC')
    } else {
      query.orderBy('liked.createdAt', 'DESC')
    }

    const [entities, total] = await query.skip(start).take(perPage).getManyAndCount()

    const data = entities.map((l) => ({
      id: l.id,
      createdAt: l.createdAt,
      project: {
        id: l.project?.id,
        title: l.project?.title,
        projectType: l.project?.projectType,
        status: l.project?.status,
        positions: l.project?.positions ?? [],
        techStacks: l.project?.techStacks ?? [],
        recruitEndDate: l.project?.recruitEndDate,
        maxMembers: l.project?.maxMembers
      }
    }))

    return { data, total }
  }
}
