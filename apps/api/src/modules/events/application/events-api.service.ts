import type {
  EventRegistrationProjection,
  EventsApi,
  RegisterForEventCommand,
} from "@events/public/events-api";
import { EventService } from "@events/services/event.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EventsApiService implements EventsApi {
  constructor(private readonly eventService: EventService) {}

  enrollInEvent(
    command: RegisterForEventCommand,
  ): Promise<EventRegistrationProjection> {
    return this.eventService.enrollInEvent(command.eventId, {
      id: command.userId,
    });
  }

  cancelEventRegistration(
    command: RegisterForEventCommand,
  ): Promise<EventRegistrationProjection> {
    return this.eventService.cancelEventRegistration(command.eventId, {
      id: command.userId,
    });
  }
}
