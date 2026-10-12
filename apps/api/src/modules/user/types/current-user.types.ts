import { Role, UserStatus } from "@prisma/client";

export type CurrentUserType = {
  sub: string;
  role: Role;
  status: UserStatus;
  email?: string | null;
};
