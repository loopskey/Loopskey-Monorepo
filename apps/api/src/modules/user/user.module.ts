import { UserResolver } from "@user/resolvers/user.resolver";
import { PrismaModule } from "@prisma/prisma.module";
import { UserService } from "@user/services/user.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [PrismaModule],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
