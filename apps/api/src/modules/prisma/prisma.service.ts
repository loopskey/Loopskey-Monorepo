import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      transactionOptions: {
        maxWait: 10_000,
        timeout: 15_000,
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
