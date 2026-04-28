import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ChallengeBaseEvent, ChallengeEventType } from './types/event.types'

@Injectable()
export class ChallengeEventPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  publish<T extends ChallengeEventType>(event: ChallengeBaseEvent<T>) {
    this.eventEmitter.emit(event.type, event)
  }
}
