import { EventResolver } from "@events/resolvers/event.resolver";
import { PrismaModule } from "@prisma/prisma.module";
import { EventService } from "@events/services/event.service";
import { Module } from "@nestjs/common";

import "@events/enums/event-register.enum";

@Module({
  imports: [PrismaModule],
  providers: [EventResolver, EventService],
  exports: [EventService],
})
export class EventModule {}
