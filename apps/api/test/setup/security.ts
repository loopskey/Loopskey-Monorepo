import { INestApplication } from "@nestjs/common";
import { Role, UserStatus } from "@prisma/client";
import { MailService } from "@mail/mail.service";
import { PrismaService } from "@prisma/prisma.service";
import { bootApp } from "./concurrency";

import request from "supertest";
import * as argon2 from "argon2";

export const SECURITY_PASSWORD = "Security-Test-Pass-1";

export type SecurityApp = {
  app: INestApplication;
  prisma: PrismaService;
  sendEmail: jest.Mock;
};

export const bootSecurityApp = async (): Promise<SecurityApp> => {
  const sendEmail = jest.fn().mockResolvedValue(undefined);
  const { app, prisma } = await bootApp((builder) =>
    builder
      .overrideProvider(MailService)
      .useValue({ sendEmail, deliver: jest.fn() }),
  );
  return { app, prisma, sendEmail };
};

type SeedOptions = {
  role?: Role;
  status?: UserStatus;
  fullName?: string;
  verified?: boolean;
  password?: string | null;
};

export const seedUser = async (
  prisma: PrismaService,
  email: string,
  options: SeedOptions = {},
) =>
  prisma.user.create({
    data: {
      email,
      role: options.role ?? Role.PROFESSIONAL,
      status: options.status ?? UserStatus.ACTIVE,
      fullName: options.fullName,
      emailVerifiedAt: options.verified === false ? null : new Date(),
      passwordHash:
        options.password === null
          ? null
          : await argon2.hash(options.password ?? SECURITY_PASSWORD),
    },
  });

export const graphql = (
  app: INestApplication,
  query: string,
  variables?: Record<string, unknown>,
  cookies?: string[],
  headers: Record<string, string> = {},
) => {
  const call = request(app.getHttpServer()).post("/graphql").set(headers);
  if (cookies) call.set("Cookie", cookies);
  return call.send({ query, variables });
};

const LOGIN = `mutation($input: LoginInput!) { login(input: $input) { code } }`;

export const signIn = async (
  app: INestApplication,
  email: string,
  password = SECURITY_PASSWORD,
) => {
  const response = await graphql(app, LOGIN, { input: { email, password } });
  const cookies = response.headers["set-cookie"] as unknown as
    | string[]
    | undefined;
  if (!cookies) throw new Error(`Sign-in failed for ${email}.`);
  return cookies;
};

export const errorCode = (response: request.Response) =>
  response.body.errors?.[0]?.extensions?.code as string | undefined;

export const dataOf = <T>(response: request.Response, key: string) =>
  response.body.data?.[key] as T | undefined;
