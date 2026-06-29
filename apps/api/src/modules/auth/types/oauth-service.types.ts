import { Role } from "@prisma/client";

export type TOAuthProvider = "GOOGLE";

export type TOAuthProfile = {
  role: Role;
  email: string;
  fullName: string;
  providerId: string;
  provider: TOAuthProvider;
  avatarUrl?: string | null;
};
