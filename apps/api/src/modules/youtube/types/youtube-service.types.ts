import { Role } from "@prisma/client";

export type TCurrentUserPayload = {
  role: Role;
  id?: string;
  sub?: string;
};
