import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ChallengeBookmarked } from './challenge-bookmarked.entity'
import { GetBookmarkedReqDto } from './dto/req/get-bookmarked.req.dto'
import { GetBookmarkedResDto } from './dto/res/get-bookmarked.res.dto'
import { IdParamsDto } from '@data/dto/id-params.dto'

@Injectable()
export class ChallengeBookmarkedService {
  constructor(
    @InjectRepository(ChallengeBookmarked)
    private bookmarkedRepository: Repository<ChallengeBookmarked>
  ) {}

  async bookmark(challengeId: number, userId: number): Promise<IdParamsDto> {
    const existing = await this.bookmarkedRepository.findOne({ where: { challengeId, userId } })
    if (existing) throw new ConflictException('already_bookmarked')

    const bookmarked = new ChallengeBookmarked({ challengeId, userId })
    await this.bookmarkedRepository.save(bookmarked)
    return { id: bookmarked.id }
  }

  async unbookmark(challengeId: number, userId: number): Promise<void> {
    const bookmarked = await this.bookmarkedRepository.findOne({ where: { challengeId, userId } })
    if (!bookmarked) throw new NotFoundException()

    await this.bookmarkedRepository.delete({ id: bookmarked.id })
  }

  async findAllByUser(userId: number, options: GetBookmarkedReqDto): Promise<GetBookmarkedResDto> {
    const { sort, order, start, perPage } = options
    const query = this.bookmarkedRepository
      .createQueryBuilder('bookmarked')
      .where('bookmarked.userId = :userId', { userId })

    if (sort && order) {
      query.orderBy(`bookmarked.${sort}`, order as 'ASC' | 'DESC')
    } else {
      query.orderBy('bookmarked.createdAt', 'DESC')
    }

    const [data, total] = await query.skip(start).take(perPage).getManyAndCount()

    return { data, total }
  }
}
