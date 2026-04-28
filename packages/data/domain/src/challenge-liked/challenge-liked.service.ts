import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ChallengeLiked } from './challenge-liked.entity'
import { GetLikedReqDto } from './dto/req/get-liked.req.dto'
import { PostLikedResDto } from './dto/res/post-liked.res.dto'
import { GetLikedResDto } from './dto/res/get-liked.res.dto'
import { IdParamsDto } from '@data/dto/id-params.dto'

@Injectable()
export class ChallengeLikedService {
  constructor(
    @InjectRepository(ChallengeLiked)
    private likedRepository: Repository<ChallengeLiked>
  ) {}

  async like(challengeId: number, userId: number): Promise<IdParamsDto> {
    const existing = await this.likedRepository.findOne({ where: { challengeId, userId } })
    if (existing) throw new ConflictException('already_liked')

    const liked = new ChallengeLiked({ challengeId, userId })
    await this.likedRepository.save(liked)
    return { id: liked.id }
  }

  async unlike(challengeId: number, userId: number): Promise<void> {
    const liked = await this.likedRepository.findOne({ where: { challengeId, userId } })
    if (!liked) throw new NotFoundException()

    await this.likedRepository.delete({ id: liked.id })
  }

  async findAllByUser(userId: number, options: GetLikedReqDto): Promise<GetLikedResDto> {
    const { sort, order, start, perPage } = options
    const query = this.likedRepository.createQueryBuilder('liked').where('liked.userId = :userId', { userId })

    if (sort && order) {
      query.orderBy(`liked.${sort}`, order as 'ASC' | 'DESC')
    } else {
      query.orderBy('liked.createdAt', 'DESC')
    }

    const [data, total] = await query.skip(start).take(perPage).getManyAndCount()

    return { data, total }
  }
}
