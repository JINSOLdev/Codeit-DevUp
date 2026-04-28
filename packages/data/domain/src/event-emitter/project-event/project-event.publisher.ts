import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ProjectBaseEvent, ProjectEventType } from './types/event.types'

@Injectable()
export class ProjectEventPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  publish<T extends ProjectEventType>(event: ProjectBaseEvent<T>) {
    this.eventEmitter.emit(event.type, event)
  }
}
