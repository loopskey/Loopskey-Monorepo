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
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
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
          ASSOCIATION_LOGIN_URL: "https://app.example.com/auth/association",
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

describe("AssociationAccountService account directory", () => {
  const row = (id: string, status: UserStatus = UserStatus.PENDING) => ({
    ...createdAssociation,
    id,
    owner: { ...createdAssociation.owner, status },
  });

  it("flattens the owner onto every row and never returns the owner object", async () => {
    const { service, prisma } = setup();
    prisma.association.findMany.mockResolvedValue([row("assoc-1")]);
    prisma.association.count.mockResolvedValue(1);

    const page = await service.listAccounts();

    expect(page.items).toHaveLength(1);
    expect(page.items[0]).toMatchObject({
      id: "assoc-1",
      ownerEmail: "chair@example.org",
      ownerStatus: UserStatus.PENDING,
    });
    expect(page.items[0]).not.toHaveProperty("owner");
    expect(page.totalCount).toBe(1);
  });

  it("reads one row past the page to decide the next cursor without a second query", async () => {
    const { service, prisma } = setup();
    prisma.association.findMany.mockResolvedValue([
      row("assoc-1"),
      row("assoc-2"),
      row("assoc-3"),
    ]);

    const page = await service.listAccounts(undefined, { take: 2 });

    expect(prisma.association.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 3 }),
    );
    expect(page.items.map((item) => item.id)).toEqual(["assoc-1", "assoc-2"]);
    expect(page.pageInfo).toEqual({ hasNextPage: true, nextCursor: "assoc-2" });
  });

  it("reports no next cursor once the last page fits", async () => {
    const { service, prisma } = setup();
    prisma.association.findMany.mockResolvedValue([row("assoc-1")]);

    const page = await service.listAccounts(undefined, { take: 2 });

    expect(page.pageInfo).toEqual({ hasNextPage: false, nextCursor: null });
  });

  it("skips the cursor row so a page never repeats its predecessor", async () => {
    const { service, prisma } = setup();

    await service.listAccounts(undefined, { take: 2, cursor: "assoc-9" });

    expect(prisma.association.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: { id: "assoc-9" }, skip: 1 }),
    );
  });

  it("keeps the search predicate on the association row so no join blocks the index", async () => {
    const { service, prisma } = setup();

    await service.listAccounts({ search: "  nurses  " });

    const { where } = prisma.association.findMany.mock.calls[0][0];
    expect(where.OR).toEqual([
      { name: { contains: "nurses", mode: "insensitive" } },
      { contactEmail: { contains: "nurses", mode: "insensitive" } },
    ]);
  });

  it("leaves a one-character term on the unsearched path", async () => {
    const { service, prisma } = setup();

    await service.listAccounts({ search: "n" });

    const { where } = prisma.association.findMany.mock.calls[0][0];
    expect(where).not.toHaveProperty("OR");
  });

  it("counts the same rows it lists", async () => {
    const { service, prisma } = setup();

    await service.listAccounts({ ownerStatus: UserStatus.PENDING });

    const listed = prisma.association.findMany.mock.calls[0][0].where;
    const counted = prisma.association.count.mock.calls[0][0].where;
    expect(counted).toEqual(listed);
    expect(listed).toMatchObject({
      deletedAt: null,
      owner: { status: UserStatus.PENDING },
    });
  });

  it("hides soft-deleted associations from the directory", async () => {
    const { service, prisma } = setup();

    await service.listAccounts();

    expect(prisma.association.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null } }),
    );
  });
});
