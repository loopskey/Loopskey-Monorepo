import { PrismaService } from "./prisma.service";
import { Module } from "@nestjs/common";
import { RoleProfileRegistry } from "./role-profile-registry.service";

@Module({
  providers: [PrismaService, RoleProfileRegistry],
  exports: [PrismaService, RoleProfileRegistry],
})
export class PrismaModule {}
