import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProjectComment } from './project-comment.entity'
import { Project } from '../project/project.entity'
import { IdParamsDto } from '@data/dto'
import { GetCommentsReqDto } from './dto/req/get-comments.req.dto'
import { PostProjectCommentReqDto } from './dto/req/post-project-comment.req.dto'
import { PatchProjectCommentReqDto } from './dto/req/patch-project-comment.req.dto'
import { GetProjectCommentsResDto } from './dto/res/get-comments.res.dto'
import { GetMyCommentsResDto } from './dto/res/get-my-comments.res.dto'
import { User } from '../user/entities/user.entity'
import { ProjectEventPublisher } from '../event-emitter/project-event/project-event.publisher'
import { ProjectEventType } from '../event-emitter/project-event/types/event.types'

@Injectable()
export class ProjectCommentService {
  constructor(
    @InjectRepository(ProjectComment)
    private commentRepository: Repository<ProjectComment>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventPublisher: ProjectEventPublisher
  ) {}

  async create(projectId: number, userId: number, data: PostProjectCommentReqDto): Promise<IdParamsDto> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      select: ['id', 'hostId', 'title']
    })
    if (!project) throw new NotFoundException('not_found_project_info')

    const comment = new ProjectComment({ projectId, userId, content: data.content })
    try {
      await this.commentRepository.save(comment)
    } catch (e) {
      if (e?.code === '23505') throw new ConflictException('duplicate')
      throw e
    }

    if (project.hostId !== userId) {
      const user = await this.userRepository.findOne({ where: { id: userId }, select: ['nickname'] })
      this.eventPublisher.publish({
        type: ProjectEventType.COMMENT_CREATED,
        metadata: {
          projectId: project.id,
          projectTitle: project.title,
          hostId: project.hostId,
          commenterName: user?.nickname ?? '사용자'
        }
      })
    }

    return { id: comment.id }
  }

  async findAllByProject(projectId: number, options: GetCommentsReqDto): Promise<GetProjectCommentsResDto> {
    const { sort, order, start, perPage } = options

    const projectExists = await this.projectRepository.existsBy({ id: projectId })
    if (!projectExists) throw new NotFoundException('not_found_project_info')

    const query = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'u')
      .where('comment.projectId = :projectId', { projectId })
      .andWhere('comment.deletedAt IS NULL')

    if (sort && order) {
      query.orderBy(`comment.${sort}`, order as 'ASC' | 'DESC')
    } else {
      query.orderBy('comment.createdAt', 'ASC')
    }

    const [entities, total] = await query.skip(start).take(perPage).getManyAndCount()

    return {
      data: entities.map((c) => ({
        id: c.id,
        userId: c.userId,
        content: c.content,
        createdAt: c.createdAt,
        user: {
          id: c.user?.id,
          nickname: c.user?.nickname,
          jobLabel: c.user?.jobLabel ?? null,
          profileImageUrl: c.user?.profileImageUrl ?? null,
          skills: c.user?.skills ?? []
        }
      })),
      total
    }
  }

  async findAllByUser(userId: number, options: GetCommentsReqDto): Promise<GetMyCommentsResDto> {
    const { sort, order, start, perPage } = options

    const query = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.project', 'p')
      .where('comment.userId = :userId', { userId })
      .andWhere('comment.deletedAt IS NULL')

    if (sort && order) {
      query.orderBy(`comment.${sort}`, order as 'ASC' | 'DESC')
    } else {
      query.orderBy('comment.createdAt', 'DESC')
    }

    const [entities, total] = await query.skip(start).take(perPage).getManyAndCount()

    return {
      data: entities.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        project: {
          id: c.project?.id,
          title: c.project?.title
        }
      })),
      total
    }
  }

  async update(commentId: number, userId: number, data: PatchProjectCommentReqDto): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } })
    if (!comment) throw new NotFoundException('not_found_comment_info')
    if (comment.userId !== userId) throw new ForbiddenException('forbidden_not_author')

    comment.content = data.content
    await this.commentRepository.save(comment)
  }

  async delete(commentId: number, userId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } })
    if (!comment) throw new NotFoundException('not_found_comment_info')
    if (comment.userId !== userId) throw new ForbiddenException('forbidden_not_author')

    await this.commentRepository.softDelete({ id: commentId })
  }
}
