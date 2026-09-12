import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationComplianceService } from "@association/services/association-compliance.service";
import { AssociationMemberStatus } from "@prisma/client";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";

const DEFAULT_SWEEP_MS = 6 * 60 * 60 * 1000;

const DEFAULT_BATCH_SIZE = 200;

export type ReconcileOptions = {
  dryRun?: boolean;
  batchSize?: number;
  cursor?: string | null;
};

export type ReconcileOutcome = {
  scanned: number;
  repaired: number;
  nextCursor: string | null;
};

@Injectable()
export class AssociationComplianceReconciliationService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(
    AssociationComplianceReconciliationService.name,
  );
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly compliance: AssociationComplianceService,
  ) {}

  onModuleInit() {
    const configured = Number(
      this.config.get(
        "COMPLIANCE_RECONCILE_SWEEP_MS",
        String(DEFAULT_SWEEP_MS),
      ),
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

  async reconcile({
    dryRun = false,
    batchSize = DEFAULT_BATCH_SIZE,
    cursor = null,
  }: ReconcileOptions = {}): Promise<ReconcileOutcome> {
    const assignments =
      await this.prisma.associationRequirementAssignment.findMany({
        where: {
          isTargeted: true,
          requirement: { status: AssociationRequirementStatus.PUBLISHED },
          member: { status: { not: AssociationMemberStatus.INACTIVE } },
        },
        select: { id: true },
        orderBy: { id: "asc" },
        take: batchSize,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

    let repaired = 0;

    for (const assignment of assignments) {
      const preview = await this.compliance.previewAssignment(assignment.id);
      if (!preview?.wouldChange) continue;

      repaired += 1;
      if (!dryRun) await this.compliance.recomputeAssignment(assignment.id);
    }

    const nextCursor =
      assignments.length === batchSize
        ? (assignments.at(-1)?.id ?? null)
        : null;

    this.logger.log("Association compliance reconciliation page processed", {
      dryRun,
      scanned: assignments.length,
      repaired,
      nextCursor,
    });

    return { scanned: assignments.length, repaired, nextCursor };
  }

  /** Walks every page to completion; safe to call repeatedly. */
  async reconcileAll(
    options: Omit<ReconcileOptions, "cursor"> = {},
  ): Promise<ReconcileOutcome> {
    let cursor: string | null = null;
    let scanned = 0;
    let repaired = 0;

    do {
      const page = await this.reconcile({ ...options, cursor });
      scanned += page.scanned;
      repaired += page.repaired;
      cursor = page.nextCursor;
    } while (cursor);

    return { scanned, repaired, nextCursor: null };
  }

  private tick() {
    if (this.running) return;
    this.running = true;

    void this.reconcileAll()
      .catch((error: unknown) => {
        this.logger.error("Association compliance reconciliation failed", {
          message: error instanceof Error ? error.message : "Unknown error",
        });
      })
      .finally(() => {
        this.running = false;
      });
  }
}
