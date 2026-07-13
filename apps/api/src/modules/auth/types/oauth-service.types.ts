import { Request } from "express";
import { Role } from "@prisma/client";

export type TOAuthProvider = "GOOGLE" | "LINKEDIN";

export type TOAuthRequest = Request & {
  oauthRole?: Role;
};

export type TOAuthProfile = {
  role: Role;
  email: string;
  fullName: string;
  providerId: string;
  provider: TOAuthProvider;
  avatarUrl?: string | null;
  emailVerified?: boolean | null;
};

export type TOAuthStatePayload = {
  role: Role;
  nonce: string;
  provider: TOAuthProvider;
};

export type TLinkedInUserInfo = {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
};
