import { Inject, Injectable, Logger } from "@nestjs/common";
import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { AssociationGeneratedReportState } from "@prisma/client";
import { type ObjectStoragePort } from "@infrastructure/storage/object-storage.port";
import { OBJECT_STORAGE } from "@infrastructure/storage/object-storage.port";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";

const DEFAULT_SWEEP_MS = 60 * 60 * 1000;

const SWEEP_BATCH = 100;

@Injectable()
export class AssociationReportRetentionService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(AssociationReportRetentionService.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStoragePort,
  ) {}

  onModuleInit() {
    const configured = Number(
      this.config.get("REPORT_EXPIRY_SWEEP_MS", String(DEFAULT_SWEEP_MS)),
    );
    const interval =
      Number.isFinite(configured) && configured > 0
        ? configured
        : DEFAULT_SWEEP_MS;

    this.timer = setInterval(() => this.tick(), interval);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async sweep(now = new Date()) {
    const due = await this.prisma.associationGeneratedReport.findMany({
      where: {
        state: AssociationGeneratedReportState.READY,
        expiresAt: { lte: now },
      },
      select: { id: true, storageKey: true },
      take: SWEEP_BATCH,
    });

    let expired = 0;

    for (const record of due) {
      await this.storage.remove("report", record.storageKey);

      const { count } = await this.prisma.associationGeneratedReport.updateMany(
        {
          where: {
            id: record.id,
            state: AssociationGeneratedReportState.READY,
          },
          data: { state: AssociationGeneratedReportState.EXPIRED },
        },
      );

      expired += count;
    }

    if (expired > 0)
      this.logger.log("Association report exports expired", { expired });

    return expired;
  }

  private tick() {
    if (this.running) return;
    this.running = true;

    void this.sweep()
      .catch((error: unknown) => {
        this.logger.error("Association report export sweep failed", {
          message: error instanceof Error ? error.message : "Unknown error",
        });
      })
      .finally(() => {
        this.running = false;
      });
  }
}
