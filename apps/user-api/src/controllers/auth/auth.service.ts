import { User, UserAccount, UserPassword, UserSetting, Verification } from '@data/domain'
import { UserEventPublisher } from '@data/domain/event-emitter/user-event/user-event.publisher'
import { UserEventType } from '@data/domain/event-emitter/user-event/types/event.types'
import { UserAccountType, UserService, JobLabel } from '@data/domain/user'
import { VERIFICATION_AUDIENCE } from '@data/domain/verification'
import { createPasswordHash, passwordIterations, verifyPassword } from '@data/lib'
import { SocialService } from '@infra/social'
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@system/jwt'
import { DataSource, Repository } from 'typeorm'
import { JwtStrategy } from '../../strategies/jwt.strategy'
import { PostAuthRegisterReqDto } from './dto/req/post-auth-register.req.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserPassword)
    private readonly userPasswordRepository: Repository<UserPassword>,
    @InjectRepository(UserAccount)
    private readonly userAccountRepository: Repository<UserAccount>,
    private readonly socialService: SocialService,
    private readonly userService: UserService,
    private readonly eventPublisher: UserEventPublisher,
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>
  ) {}

  async register(options: PostAuthRegisterReqDto & { type: UserAccountType }) {
    const { type, position, email, nickname, password } = options

    if (!position) throw new BadRequestException('position_required')
    if (!email) throw new BadRequestException('email_required')
    if (!nickname) throw new BadRequestException('nickname_required')
    if (!password) throw new BadRequestException('password_required')

    const existsEmail = await this.userRepository.findOne({
      where: { email }
    })
    if (existsEmail) {
      throw new ConflictException('duplicate_email')
    }

    const existsNickname = await this.userRepository.findOne({
      where: { nickname }
    })
    if (existsNickname) {
      throw new ConflictException('duplicate_nickname')
    }

    const existsAccount = await this.userAccountRepository.findOne({
      where: {
        type,
        accountId: email
      }
    })
    if (existsAccount) {
      throw new ConflictException('duplicate_account')
    }

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      const user = new User({ email, nickname, jobLabel: position, skills: [] })
      await queryRunner.manager.save(user)

      const passwordHash = createPasswordHash(password, passwordIterations.user)

      const userPassword = new UserPassword({
        userId: user.id,
        user,
        hashedPassword: passwordHash.password,
        salt: passwordHash.salt
      })

      const account = new UserAccount({
        userId: user.id,
        user,
        type,
        accountId: email
      })

      const userSetting = new UserSetting({
        userId: user.id,
        user,
        agreeMarketing: false
      })

      await queryRunner.manager.save(userPassword)
      await queryRunner.manager.save(account)
      await queryRunner.manager.save(userSetting)

      await queryRunner.commitTransaction()
      this.eventPublisher.publish({
        type: UserEventType.USER_SIGNED_UP,
        metadata: { userId: user.id }
      })

      return this.generateTokenWithUser(user)
    } catch (e) {
      await queryRunner.rollbackTransaction()
      if (e.code === 'ER_DUP_ENTRY' || e.code === '23505') {
        throw new ConflictException('duplicate')
      }
      throw e
    } finally {
      await queryRunner.release()
    }
  }

  async checkEmailAvailability(email: string) {
    if (!email) {
      throw new BadRequestException('email_required')
    }

    const exists = await this.userRepository.findOne({
      where: { email }
    })

    if (exists) {
      return {
        isAvailable: false,
        message: '이미 사용 중인 아이디 입니다.'
      }
    }

    return {
      isAvailable: true,
      message: '사용 가능한 아이디 입니다.'
    }
  }

  async validateUserByEmail(email: string, password: string) {
    if (!email) {
      throw new BadRequestException('email_required')
    }
    if (!password) {
      throw new BadRequestException('password_required')
    }

    const account = await this.userAccountRepository.findOne({
      where: {
        type: UserAccountType.local,
        accountId: email
      },
      relations: {
        user: {
          password: true
        }
      }
    })

    if (!account || !account.user || !account.user.password) {
      throw new NotFoundException('not_found')
    }

    const isValid = verifyPassword(
      password,
      account.user.password.hashedPassword,
      account.user.password.salt,
      passwordIterations.user
    )

    if (!isValid) {
      throw new NotFoundException('not_found')
    }

    return this.generateTokenWithUser(account.user)
  }

  async validateUserBySocial(type: string, token: string) {
    const payload = (await this.jwtService.verifyToken(token, {
      audience: SocialService.AUDIENCE
    })) as { sub: string; email?: string; name?: string; profileImage?: string; gender?: string; birthday?: string }
    const { sub, email, name, profileImage, gender, birthday } = payload
    const account = await this.userAccountRepository.findOne({
      where: { type: type as UserAccountType, accountId: sub },
      relations: {
        user: true
      }
    })

    if (account) {
      return this.generateTokenWithUser(account.user)
    }

    throw new NotFoundException({
      message: '소셜 계정으로 가입된 사용자가 없습니다.',
      code: 'social_user_not_found',
      data: {
        socialType: type,
        socialId: sub,
        email: email ?? null,
        name: name ?? null,
        profileImage: profileImage ?? null,
        gender: gender ?? null,
        birthday: birthday ?? null
      }
    })
  }

  async registerSocialUser(data: {
    type: string
    token: string
    nickname: string
    email?: string
    profileImageUrl?: string
  }) {
    const payload = (await this.jwtService.verifyToken(data.token, {
      audience: SocialService.AUDIENCE
    })) as { sub: string; email?: string }
    const { sub, email } = payload

    // Check if same social account already exists
    const existingAccount = await this.userAccountRepository.findOne({
      where: { type: data.type as UserAccountType, accountId: sub }
    })
    if (existingAccount) {
      throw new ConflictException(`already_account_exists, type=${existingAccount.type}`)
    }

    // Check if email is already registered under any account type
    const resolvedEmail = data.email || email || null
    if (resolvedEmail) {
      const existingUser = await this.userRepository.findOne({
        where: { email: resolvedEmail },
        relations: { accounts: true }
      })
      if (existingUser) {
        const existingTypes = existingUser.accounts.map((account) => account.type).filter(Boolean)
        const typeSuffix = existingTypes.length > 0 ? existingTypes.join(',') : 'local'
        throw new ConflictException(`already_account_exists, type=${typeSuffix}`)
      }
    }

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Create user with social account info
      const user = new User({
        email: data.email || email || `${data.type}_${sub}@placeholder.com`,
        nickname: data.nickname,
        profileImageUrl: data.profileImageUrl,
        skills: []
      })
      await queryRunner.manager.save(user)

      // Create social account
      const account = new UserAccount({
        userId: user.id,
        user,
        type: data.type as UserAccountType,
        accountId: sub
      })

      const userSetting = new UserSetting({
        userId: user.id,
        user,
        agreeMarketing: false
      })

      await queryRunner.manager.save(account)
      await queryRunner.manager.save(userSetting)

      await queryRunner.commitTransaction()
      this.eventPublisher.publish({
        type: UserEventType.USER_SIGNED_UP,
        metadata: { userId: user.id }
      })

      return this.generateTokenWithUser(user)
    } catch (e) {
      await queryRunner.rollbackTransaction()
      if (e.code === 'ER_DUP_ENTRY' || e.code === '23505') {
        throw new ConflictException('duplicate')
      }
      throw e
    } finally {
      await queryRunner.release()
    }
  }

  async validateSocialToken(type: string, socialToken: string) {
    try {
      const account = await this.socialService.getAccountIdFromToken(type as any, socialToken)
      if (account?.id) {
        const { id, ...user } = account
        const exp = Math.floor(Date.now() / 1000) + SocialService.TOKEN_EXPIRE_TIME
        const token = await this.jwtService.createToken({
          sub: account.id,
          exp,
          aud: SocialService.AUDIENCE
        })
        return { token, user }
      }
    } catch (e) {
      throw new NotFoundException('invalid_token')
    }
    throw new NotFoundException('not_found')
  }

  async verifyDuplicate(email: string): Promise<boolean> {
    try {
      await this.userAccountRepository.findOneOrFail({ where: { type: UserAccountType.local, accountId: email } })
    } catch (e) {
      return true
    }
    throw new ConflictException()
  }

  async changePassword(options: { password: string; newPassword: string; userId: number }) {
    const { password, newPassword, userId } = options
    if (password === newPassword) throw new BadRequestException('same_password')
    const account = await this.userAccountRepository.findOne({
      where: {
        type: UserAccountType.local,
        user: {
          id: userId
        }
      },
      relations: { user: { password: true } }
    })
    if (account && account.user.password) {
      if (
        verifyPassword(
          password,
          account.user.password.hashedPassword,
          account.user.password.salt,
          passwordIterations.user
        )
      ) {
        const passwordHash = createPasswordHash(newPassword, passwordIterations.user)
        await this.userPasswordRepository.update(
          { user: { id: userId } },
          {
            hashedPassword: passwordHash.password,
            salt: passwordHash.salt
          }
        )
        await this.invalidateAllSessions(userId.toString())
        return this.generateTokenWithUser(account.user)
      } else {
        throw new BadRequestException('wrong_password')
      }
    } else {
      throw new ConflictException('not_found_password')
    }
  }

  async resetPassword(options: { email?: string; phone?: string; password: string; codeToken: string }) {
    const { email, password, phone, codeToken } = options
    const { sub: verificationId } = await this.jwtService.verifyToken(codeToken, { audience: VERIFICATION_AUDIENCE })
    const verification = await this.verificationRepository.findOne({
      where: {
        id: verificationId,
        email,
        phone,
        used: false,
        confirmed: true
      }
    })
    if (!verification || verification.type !== 'resetPassword') throw new BadRequestException('invalid_code_token')
    const queryRunner = this.verificationRepository.manager.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      verification.used = true
      await this.verificationRepository.save(verification)

      const user = await this.userService.findByEmailOrPhone({ phone, email })
      if (user) {
        const localAccount = user.accounts.find((a) => a.type === UserAccountType.local)
        if (localAccount) {
          const passwordHash = createPasswordHash(password, passwordIterations.user)
          await this.userPasswordRepository.update(
            { user: { id: user.id } },
            {
              hashedPassword: passwordHash.password,
              salt: passwordHash.salt
            }
          )
          await queryRunner.commitTransaction()
          await this.invalidateAllSessions(user.id.toString())
          return
        }
        const otherAccountTypes = user.accounts.map((a) => a.type).filter((type) => type !== UserAccountType.local)
        throw new ConflictException(otherAccountTypes.join(','))
      }
      throw new NotFoundException('not_found_user')
    } catch (e) {
      await queryRunner.rollbackTransaction()
    } finally {
      await queryRunner.release()
    }
  }

  async logout(userId: number, token: string) {
    await this.jwtService.invalidateRefreshToken(token, userId.toString(), JwtStrategy.AUDIENCE)
  }

  async refreshToken(oldRefreshToken: string) {
    const refreshToken = await this.jwtService.refreshToken(
      oldRefreshToken,
      JwtStrategy.AUDIENCE,
      JwtStrategy.EXPIRE_IN_ACCESS_TOKEN
    )
    const { sub } = this.jwtService.decodeToken(refreshToken)

    return await this.generateToken(sub)
  }

  // private async updateUserVersion(userId: number) {
  //   await this.userRepository.increment({ id: userId }, 'version', 1)
  //   const user = await this.userRepository.findOneOrFail({ where: { id: userId }, select: { version: true } })
  //   await this.jwtService.setVersion(userId.toString(), JwtStrategy.AUDIENCE, user.version)
  //   return user.version
  // }
  private async invalidateAllSessions(sub: string) {
    return this.jwtService.invalidateAllSessions(sub, JwtStrategy.AUDIENCE)
  }

  private async generateToken(sub: string) {
    const user = await this.userRepository.findOneOrFail({
      where: { id: Number(sub) },
      select: { id: true, email: true, nickname: true }
    })

    const accessTokenInfo = await this.createAccessToken(sub)
    const refreshToken = await this.jwtService.createRefreshToken(
      {
        sub,
        aud: JwtStrategy.AUDIENCE
      },
      JwtStrategy.EXPIRE_IN_REFRESH_TOKEN / 1000
    )

    return {
      user: {
        id: Number(sub),
        email: user.email,
        nickname: user.nickname
      },
      accessToken: accessTokenInfo.accessToken,
      expiresIn: accessTokenInfo.expiresIn,
      refreshToken: refreshToken
    }
  }

  private async generateTokenWithUser(user: User) {
    return await this.generateToken(user.id.toString())
  }

  private async createAccessToken(sub: string) {
    const user = await this.userRepository.findOneOrFail({
      where: { id: Number(sub) },
      select: { id: true, email: true, nickname: true }
    })

    const exp: number = Math.floor(Date.now() / 1000) + JwtStrategy.EXPIRE_IN_ACCESS_TOKEN

    const accessToken: string = await this.jwtService.createToken(
      {
        sub,
        aud: JwtStrategy.AUDIENCE,
        email: user.email,
        nickname: user.nickname
      },
      { expiresIn: JwtStrategy.EXPIRE_IN_ACCESS_TOKEN / 1000 }
    )
    return {
      accessToken: accessToken,
      expiresIn: exp
    }
  }

  // private invalidateAllSessions(sub: string) {
  //   return this.jwtService.invalidateAllSessions(sub, JwtStrategy.AUDIENCE)
  // }
}
