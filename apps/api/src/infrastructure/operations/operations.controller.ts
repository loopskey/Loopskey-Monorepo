import { Controller, Get, SetMetadata } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

@Controller()
export class OperationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  @SetMetadata("isPublic", true)
  health() {
    return { status: "ok" };
  }

  @Get("ready")
  @SetMetadata("isPublic", true)
  async readiness() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: "ready", checks: { database: "up" } };
  }
}
