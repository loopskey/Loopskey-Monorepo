import { OrganizationMemberStatus, Prisma, Role } from "@prisma/client";

export type TAdminDashboardUser = {
  id: string;
  role: Role;
};

export type TAdminDateRange = {
  from: Date;
  to: Date;
};

export type TResolverUser = { id?: string; sub?: string; role: Role };

// =================== Admin Org ===================
export type TAdminOrgSearchRow = {
  id: string;
  name: string;
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

export type TAdminOrgCountRow = {
  totalCount: bigint | number;
};

export type TAdminOrgMemberSearchRow = {
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
