import { OrganizationMemberStatus, Prisma, Role } from "@prisma/client";

export type TOrganizationDashboardUser = {
  id: string;
  role: Role;
};

export type TResolvedOrganizationAccess = {
  ownerId: string;
  organizationId: string;
};

export type TResolverUser = { id?: string; sub?: string; role: Role };

export type TOrganizationRow = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  logoUrl: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  totalMembers: bigint | number;
  activeMembers: bigint | number;
  totalPdus: number | Prisma.Decimal | null;
  averageCompliance: number | Prisma.Decimal | null;
};

export type TCountRow = { totalCount: bigint | number };

export type TMemberRow = {
  id: string;
  pdus: number;
  joinedAt: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  compliance: number;
  email: string | null;
  organizationId: string;
  jobRole: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  completedLearning: number;
  departmentId: string | null;
  departmentTitle: string | null;
  status: OrganizationMemberStatus;
};
