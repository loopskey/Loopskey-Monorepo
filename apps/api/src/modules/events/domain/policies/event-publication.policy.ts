import { EventStatus } from "@prisma/client";

export function shouldEmitEventPublished(status: EventStatus): boolean {
  return status !== EventStatus.PUBLISHED;
}
