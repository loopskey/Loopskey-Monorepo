import { Prisma, Role } from "@prisma/client";

export type TResolverUser = { id?: string; sub?: string; role: Role };

export type TIngestionAdminActor = { id: string; role: Role };

export type Pagination = { take: number; cursor?: string };

export type TIngestionItemRow = Prisma.IngestionItemGetPayload<{
  include: {
    source: { select: { slug: true; kind: true } };
    reviewedBy: { select: { fullName: true; email: true } };
  };
}>;
