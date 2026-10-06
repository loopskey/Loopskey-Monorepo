import { IngestionContentKind, Prisma, Role } from "@prisma/client";

export type TBulkApprovalScope = {
  itemIds: string[] | null;
  sourceId: string | null;
  search: string | null;
};

export type TClaimedIngestionItem = {
  id: string;
  sourceId: string;
  catalogId: string | null;
  kind: IngestionContentKind;
};

export type TResolverUser = { id?: string; sub?: string; role: Role };

export type TIngestionAdminActor = { id: string; role: Role };

export type Pagination = { take: number; cursor?: string };

export type TIngestionItemRow = Prisma.IngestionItemGetPayload<{
  include: {
    source: { select: { slug: true; kind: true } };
    reviewedBy: { select: { fullName: true; email: true } };
  };
}>;
