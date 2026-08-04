import { Global, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { CorrelationIdMiddleware } from "../observability/correlation-id.middleware";
import { OperationsController } from "./operations.controller";
import { PrismaModule } from "@prisma/prisma.module";

@Global()
@Module({ imports: [PrismaModule], controllers: [OperationsController] })
export class OperationsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
