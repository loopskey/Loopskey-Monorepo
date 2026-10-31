import { Role } from "@prisma/client";

export type TReservedOtp = {
  id: string;
  role: Role;
  email: string;
  fullName: string;
  otpCodeHash: string;
  passwordHash: string;
};
