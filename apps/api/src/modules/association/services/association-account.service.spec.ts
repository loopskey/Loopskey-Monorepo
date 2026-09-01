import { ConflictException } from "@nestjs/common";
import { AuditAction, Prisma, UserStatus } from "@prisma/client";
import type { ConfigService } from "@nestjs/config";
import type { MailService } from "@mail/mail.service";
import type { OutboxService } from "@infrastructure/outbox/outbox.service";
import type { PrismaService } from "@prisma/prisma.service";

import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationAccountService } from "./association-account.service";

const input = {
  name: "Example Association",
  representativeFullName: "Ada Chair",
  workEmail: " Chair@Example.org ",
};

const createdAssociation = {
  id: "assoc-1",
  name: input.name,
  logoUrl: null,
  description: null,
  country: null,
  website: null,
  contactEmail: "chair@example.org",
  createdAt: new Date(),
  updatedAt: new Date(),
  settings: { id: "settings-1" },
  owner: {
    email: "chair@example.org",
    fullName: "Ada Chair",
    status: UserStatus.PENDING,
  },
};

const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "6.11.1",
    meta: { target: ["email"] },
  });

const setup = (
  overrides: {
    createOwner?: jest.Mock;
    associationCreate?: jest.Mock;
  } = {},
) => {
  const tx = {
    association: {
      create:
        overrides.associationCreate ??
        jest.fn().mockResolvedValue(createdAssociation),
    },
  };
  const prisma = {
    association: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((argument: unknown) =>
      (argument as (client: typeof tx) => unknown)(tx),
    ),
  };
  const config = {
    get: jest.fn(
      (name: string, fallback?: string) =>
        ({
          APPLICATION_BASE_URL: "https://app.example.com",
          ASSOCIATION_LOGIN_URL: "https://app.example.com/auth/professional",
          SUPPORT_EMAIL: "support@example.com",
        })[name] ?? fallback,
    ),
  };
  const mail = { sendEmail: jest.fn().mockResolvedValue({ id: "event-1" }) };
  const outbox = { append: jest.fn().mockResolvedValue({ id: "event-2" }) };
  const identity = {
    createPendingAssociationOwner:
      overrides.createOwner ?? jest.fn().mockResolvedValue({ id: "user-1" }),
  };
  const activation = {
    issueActivationLink: jest.fn().mockResolvedValue({
      activationUrl:
        "https://app.example.com/auth/association/activate?token=x",
      expiresInMinutes: 60,
    }),
    resendActivationLink: jest.fn().mockResolvedValue({
      activationUrl:
        "https://app.example.com/auth/association/activate?token=y",
      expiresInMinutes: 60,
    }),
  };
  return {
    tx,
    mail,
    outbox,
    prisma,
    identity,
    activation,
    service: new AssociationAccountService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      mail as unknown as MailService,
      outbox as unknown as OutboxService,
      identity as never,
      activation as never,
    ),
  };
};

describe("AssociationAccountService account creation", () => {
  it("creates the association, its settings and one activation mail event", async () => {
    const { service, tx, mail, outbox, identity, activation } = setup();

    await expect(service.createAccount("admin-1", input)).resolves.toEqual(
      expect.objectContaining({
        success: true,
        code: AssociationMessageCode.ACCOUNT_CREATED,
      }),
    );

    expect(identity.createPendingAssociationOwner).toHaveBeenCalledWith(
      expect.objectContaining({ email: "chair@example.org" }),
    );
    expect(tx.association.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ownerId: "user-1",
          name: "Example Association",
          settings: { create: {} },
        }),
      }),
    );
    expect(activation.issueActivationLink).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", role: "ASSOCIATION" }),
    );
    expect(mail.sendEmail).toHaveBeenCalledTimes(1);
    expect(outbox.append).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "audit.record.requested",
        payload: expect.objectContaining({
          action: AuditAction.ASSOCIATION_ACCOUNT_CREATED,
        }),
      }),
      tx,
    );
  });

  it("never leaks the activation token into the response", async () => {
    const { service } = setup();
    const result = await service.createAccount("admin-1", input);
    expect(JSON.stringify(result)).not.toContain("token=");
  });

  it("turns a lost race on the work email into a domain code, not a Prisma error", async () => {
    // Two admins submitting the same address: the loser's insert violates the
    // unique index on User.email, which is the only thing arbitrating them.
    const { service } = setup({
      createOwner: jest.fn().mockRejectedValue(uniqueViolation()),
    });

    const failure = await service
      .createAccount("admin-1", input)
      .catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(ConflictException);
    expect(failure).toMatchObject({
      response: { code: AssociationMessageCode.EMAIL_ALREADY_IN_USE },
    });
  });

  it("still reports the account when the invitation email cannot be queued", async () => {
    const { service, mail } = setup();
    mail.sendEmail.mockRejectedValue(new Error("provider down"));

    await expect(service.createAccount("admin-1", input)).resolves.toEqual(
      expect.objectContaining({
        success: true,
        code: AssociationMessageCode.ACTIVATION_EMAIL_NOT_SENT,
      }),
    );
  });
});

describe("AssociationAccountService activation resend", () => {
  const pending = {
    id: "assoc-1",
    name: "Example Association",
    owner: {
      id: "user-1",
      email: "chair@example.org",
      status: UserStatus.PENDING,
    },
  };

  it("queues a replacement email for an account still awaiting its owner", async () => {
    const { service, prisma, mail } = setup();
    prisma.association.findFirst.mockResolvedValue(pending);

    await expect(
      service.resendActivation("admin-1", "assoc-1"),
    ).resolves.toEqual(
      expect.objectContaining({
        success: true,
        code: AssociationMessageCode.ACTIVATION_EMAIL_SENT,
      }),
    );
    expect(mail.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("reports the cooldown rather than sending a second email", async () => {
    const { service, prisma, mail, activation } = setup();
    prisma.association.findFirst.mockResolvedValue(pending);
    activation.resendActivationLink.mockResolvedValue(null);

    await expect(
      service.resendActivation("admin-1", "assoc-1"),
    ).resolves.toEqual(
      expect.objectContaining({
        success: false,
        code: AssociationMessageCode.ACTIVATION_RESEND_TOO_SOON,
      }),
    );
    expect(mail.sendEmail).not.toHaveBeenCalled();
  });

  it("refuses to reissue a link for an account that is already active", async () => {
    const { service, prisma, activation } = setup();
    prisma.association.findFirst.mockResolvedValue({
      ...pending,
      owner: { ...pending.owner, status: UserStatus.ACTIVE },
    });

    await expect(
      service.resendActivation("admin-1", "assoc-1"),
    ).rejects.toMatchObject({
      response: { code: AssociationMessageCode.ALREADY_ACTIVATED },
    });
    expect(activation.resendActivationLink).not.toHaveBeenCalled();
  });
});
