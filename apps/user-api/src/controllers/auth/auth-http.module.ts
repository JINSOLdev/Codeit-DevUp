import { UserModule } from '@data/domain/user'
import { UserEventModule } from '@data/domain/event-emitter/user-event/user-event.module'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [UserModule, UserEventModule],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthHttpModule {}
