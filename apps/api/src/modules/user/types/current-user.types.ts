import { Role, UserStatus } from "@prisma/client";

export type CurrentUserType = {
  id: string;
  role: Role;
  status: UserStatus;
  email?: string | null;
  phone?: string | null;
};
