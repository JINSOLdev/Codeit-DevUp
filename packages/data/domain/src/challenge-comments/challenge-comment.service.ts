import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ChallengeComment } from './challenge-comment.entity'
import { Challenge } from '../challenge/challenge.entity'
import { GetCommentsReqDto } from './dto/req/get-comments.req.dto'
import { PostChallengeCommentReqDto } from './dto/req/post-challenge-comment.req.dto'
import { PatchChallengeCommentReqDto } from './dto/req/patch-challenge-comment.req.dto'
import { GetCommentsResDto } from './dto/res/get-comments.res.dto'
import { PostChallengeCommentResDto } from './dto/res/post-challenge-comment.res.dto'
import { DeleteChallengeCommentResDto } from './dto/res/delete-comment.res.dto'
import { PatchChallengeCommentResDto } from './dto/res/patch-challenge-comment.res.dto'
import { ChallengeEventPublisher } from '../event-emitter/challenge-event/challenge-event.publisher'
import { ChallengeEventType } from '../event-emitter/challenge-event/types/event.types'

@Injectable()
export class ChallengeCommentService {
  constructor(
    @InjectRepository(ChallengeComment)
    private commentRepository: Repository<ChallengeComment>,
    @InjectRepository(Challenge)
    private challengeRepository: Repository<Challenge>,
    private eventPublisher: ChallengeEventPublisher
  ) {}

  async create(
    challengeId: number,
    userId: number,
    data: PostChallengeCommentReqDto
  ): Promise<PostChallengeCommentResDto> {
    const content = data.content?.trim()

    if (!content) {
      throw new BadRequestException({
        message: '댓글 내용을 입력해주세요.',
        code: 'INVALID_COMMENT_CONTENT'
      })
    }

    const challenge = await this.challengeRepository.findOne({
      where: { id: challengeId },
      select: ['id', 'hostId', 'title']
    })
    if (!challenge) {
      throw new NotFoundException({
        message: '챌린지를 찾을 수 없습니다.',
        code: 'CHALLENGE_NOT_FOUND'
      })
    }

    const comment = this.commentRepository.create({
      challengeId,
      userId,
      content
    })

    const savedComment = await this.commentRepository.save(comment)

    const createdComment = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: { user: true }
    })

    if (!createdComment) {
      throw new NotFoundException()
    }

    if (challenge.hostId !== userId) {
      this.eventPublisher.publish({
        type: ChallengeEventType.COMMENT_CREATED,
        metadata: {
          challengeId: challenge.id,
          challengeTitle: challenge.title,
          hostId: challenge.hostId,
          commenterName: createdComment.user.nickname
        }
      })
    }

    return {
      message: '댓글이 작성되었습니다.',
      data: {
        id: createdComment.id,
        challengeId: createdComment.challengeId,
        author: {
          id: createdComment.userId,
          nickname: createdComment.user.nickname,
          profileImageUrl: createdComment.user.profileImageUrl ?? ''
        },
        content: createdComment.content,
        createdAt: createdComment.createdAt.toISOString()
      }
    }
  }

  async findAllByChallenge(challengeId: number, options: GetCommentsReqDto): Promise<GetCommentsResDto> {
    const { start, perPage } = options

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { challengeId },
      relations: { user: true },
      order: { createdAt: 'ASC' },
      skip: start,
      take: perPage
    })

    return {
      data: comments.map((comment) => ({
        id: comment.id,
        author: {
          id: comment.userId,
          nickname: comment.user.nickname,
          profileImageUrl: comment.user.profileImageUrl ?? ''
        },
        content: comment.content,
        createdAt: comment.createdAt.toISOString()
      })),
      total
    }
  }

  async update(
    challengeId: number,
    commentId: number,
    userId: number,
    data: PatchChallengeCommentReqDto
  ): Promise<PatchChallengeCommentResDto> {
    const content = data.content?.trim()

    if (!content) {
      throw new BadRequestException({
        message: '댓글 내용을 입력해주세요.',
        code: 'INVALID_COMMENT_CONTENT'
      })
    }

    const comment = await this.commentRepository.findOne({
      where: { id: commentId, challengeId }
    })

    if (!comment) {
      throw new NotFoundException({
        message: '댓글을 찾을 수 없습니다.',
        code: 'COMMENT_NOT_FOUND'
      })
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException({
        message: '댓글을 수정할 권한이 없습니다.',
        code: 'FORBIDDEN'
      })
    }

    await this.commentRepository.update({ id: commentId, challengeId }, { content })

    const updatedComment = await this.commentRepository.findOne({
      where: { id: commentId, challengeId }
    })

    if (!updatedComment) {
      throw new NotFoundException({
        message: '댓글을 찾을 수 없습니다.',
        code: 'COMMENT_NOT_FOUND'
      })
    }

    return {
      message: '댓글이 수정되었습니다.',
      data: {
        id: updatedComment.id,
        challengeId: updatedComment.challengeId,
        content: updatedComment.content,
        updatedAt: updatedComment.updatedAt.toISOString()
      }
    }
  }

  async delete(challengeId: number, commentId: number, userId: number): Promise<DeleteChallengeCommentResDto> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, challengeId }
    })

    if (!comment) {
      throw new NotFoundException({
        message: '댓글을 찾을 수 없습니다.',
        code: 'COMMENT_NOT_FOUND'
      })
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException({
        message: '본인이 작성한 댓글만 삭제할 수 있습니다.',
        code: 'COMMENT_DELETE_FORBIDDEN'
      })
    }

    await this.commentRepository.softDelete({ id: commentId })

    return {
      message: '댓글이 삭제되었습니다.'
    }
  }
}
