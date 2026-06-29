import { Prisma, Role, UserStatus } from "@prisma/client";

export type UserSafeSelect = Prisma.UserSelect;

export type FindUsersParams = {
  role?: Role;
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  includeDeleted?: boolean;
};

export type UpdateMeParams = {
  userId: string;
  data: {
    bio?: string;
    phone?: string;
    lastName?: string;
    fullName?: string;
    firstName?: string;
    avatarUrl?: string;
  };
};

export type UpdateUserByAdminParams = {
  userId: string;
  data: {
    role?: Role;
    bio?: string;
    email?: string;
    phone?: string;
    lastName?: string;
    fullName?: string;
    firstName?: string;
    avatarUrl?: string;
    status?: UserStatus;
  };
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
