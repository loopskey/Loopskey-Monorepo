import { Prisma, Role } from "@prisma/client";

export type TResolverUser = { id?: string; sub?: string; role: Role };

export type TAssociationUser = { id: string; role: Role };

export const ASSOCIATION_SELECT = {
  id: true,
  name: true,
  logoUrl: true,
  description: true,
  country: true,
  website: true,
  contactEmail: true,
  createdAt: true,
  updatedAt: true,
  settings: true,
  owner: { select: { email: true, fullName: true, status: true } },
} satisfies Prisma.AssociationSelect;

export type AssociationRecord = Prisma.AssociationGetPayload<{
  select: typeof ASSOCIATION_SELECT;
}>;
