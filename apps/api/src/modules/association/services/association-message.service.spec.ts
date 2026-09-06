import { AppLanguage, AssociationMessageDeliveryState } from "@prisma/client";
import { AssociationMessageType, Prisma, Role } from "@prisma/client";
import { AssociationAttentionService } from "@association/services/association-attention.service";
import { AssociationMessageSkipReason } from "@association/enums/association-attention.enum";
import { AssociationAttentionSection } from "@association/enums/association-attention.enum";
import { AssociationSettingsService } from "@association/services/association-settings.service";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMessageService } from "@association/services/association-message.service";
import { cooldownBucketFor } from "@association/services/association-message.service";
import { MESSAGE_COOLDOWN_DAYS } from "@association/services/association-message.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { type IdentityProfileApi } from "@user/public/identity-profile-api";
import { type AttentionRow } from "@association/types/association-attention.types";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";

const owner = { id: "owner-1", role: Role.ASSOCIATION };

const SECTION = AssociationAttentionSection.BELOW_THRESHOLD;

const TYPE = AssociationMessageType.BEHIND_THRESHOLD;

const row = (
  index: number,
  overrides: Partial<AttentionRow> = {},
): AttentionRow => ({
  memberId: `member-${index}`,
  userId: `user-${index}`,
  fullName: `Member ${index}`,
  email: `member-${index}@example.test`,
  memberNumber: `M-${index}`,
  groupId: "group-1",
  groupTitle: "Fellows",
  percent: 25,
  band: null,
  requiredCredits: 20,
  completedCredits: 5,
  deadline: new Date("2026-12-31T00:00:00.000Z"),
  detail: null,
  detailDate: null,
  ...overrides,
});

const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError("duplicate", {
    code: "P2002",
    clientVersion: "6.11.1",
  });

const refusal = async (act: Promise<unknown>) => {
  try {
    await act;
    return null;
  } catch (error) {
    return {
      status: (error as { getStatus: () => number }).getStatus(),
      code: (error as { getResponse: () => { code: string } }).getResponse()
        .code,
    };
  }
};

const setup = ({
  rows = [row(1)],
  recent = [],
  identities,
  languages = [],
  transaction,
  suppressAllEmail = false,
}: {
  rows?: AttentionRow[];
  recent?: { memberId: string }[];
  suppressAllEmail?: boolean;
  identities?: {
    id: string;
    email: string | null;
    fullName: string | null;
    emailVerifiedAt: Date | null;
    isActive: boolean;
  }[];
  languages?: { userId: string; language: string | null }[];
  transaction?: jest.Mock;
} = {}) => {
  const create = jest
    .fn()
    .mockImplementation(({ data }: { data: { memberId: string } }) =>
      Promise.resolve({ id: `delivery-${data.memberId}` }),
    );

  const client = {
    associationMessageDelivery: {
      create,
      findMany: jest.fn().mockResolvedValue(recent),
      count: jest.fn().mockResolvedValue(recent.length),
    },
  };

  const prisma = {
    ...client,
    $transaction:
      transaction ??
      jest
        .fn()
        .mockImplementation((run: (tx: unknown) => unknown) =>
          Promise.resolve(run(client)),
        ),
  };

  const access = {
    requireOwned: jest
      .fn()
      .mockResolvedValue({ id: "assoc-1", name: "Institute" }),
    requireReadable: jest
      .fn()
      .mockResolvedValue({ id: "assoc-1", name: "Institute" }),
  };

  const settings = {
    suppressesEmail: jest.fn().mockResolvedValue(suppressAllEmail),
  };

  const attention = { rowsFor: jest.fn().mockResolvedValue(rows) };

  const outbox = { append: jest.fn().mockResolvedValue({ id: "event-1" }) };

  const identity = {
    recipients: jest.fn().mockResolvedValue(
      identities ??
        rows.map((one) => ({
          id: one.userId,
          email: one.email,
          fullName: one.fullName,
          emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
          isActive: true,
        })),
    ),
  };

  const professional = {
    languagesForOwners: jest.fn().mockResolvedValue(languages),
  };

  const config = {
    get: jest
      .fn()
      .mockImplementation((key: string, fallback: string) =>
        key === "FRONTEND_URL" ? "https://app.loopskey.test" : fallback,
      ),
  };

  return {
    create,
    outbox,
    attention,
    identity,
    professional,
    transaction: prisma.$transaction as jest.Mock,
    settings,
    service: new AssociationMessageService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      outbox as unknown as OutboxService,
      access as unknown as AssociationAccessService,
      settings as unknown as AssociationSettingsService,
      attention as unknown as AssociationAttentionService,
      identity as unknown as IdentityProfileApi,
      professional as unknown as ProfessionalComplianceApi,
    ),
  };
};

const audience = { section: SECTION };

describe("AssociationMessageService", () => {
  describe("the cooldown", () => {
    it("puts two sends inside one window in the same bucket", () => {
      const first = new Date("2026-09-01T09:00:00.000Z");
      const second = new Date("2026-09-02T09:00:00.000Z");

      expect(cooldownBucketFor(first)).toBe(cooldownBucketFor(second));
    });

    it("separates sends a full window apart", () => {
      const first = new Date("2026-09-01T09:00:00.000Z");
      const later = new Date(
        first.getTime() + MESSAGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
      );

      expect(cooldownBucketFor(later)).not.toBe(cooldownBucketFor(first));
    });

    it("skips a member written to inside the window, and queues nothing for them", async () => {
      const { service, outbox, create } = setup({
        recent: [{ memberId: "member-1" }],
      });

      const result = await service.send(owner, TYPE, audience);

      expect(result.acceptedCount).toBe(0);
      expect(result.skipped).toEqual([
        {
          memberId: "member-1",
          fullName: "Member 1",
          reason: AssociationMessageSkipReason.COOLDOWN,
        },
      ]);
      expect(create).not.toHaveBeenCalled();
      expect(outbox.append).not.toHaveBeenCalled();
    });

    it("recovers a lost race into a skip rather than a failure", async () => {
      const { service } = setup({
        transaction: jest.fn().mockRejectedValue(uniqueViolation()),
      });

      const result = await service.send(owner, TYPE, audience);

      expect(result.acceptedCount).toBe(0);
      expect(result.skipped[0]?.reason).toBe(
        AssociationMessageSkipReason.COOLDOWN,
      );
    });

    it("scopes the cooldown read to this association", async () => {
      const { service } = setup();

      await service.send(owner, TYPE, audience);

      const query = (
        service as unknown as {
          prisma: { associationMessageDelivery: { findMany: jest.Mock } };
        }
      ).prisma.associationMessageDelivery.findMany.mock.calls[0][0];

      expect(query.where.associationId).toBe("assoc-1");
      expect(query.where.messageType).toBe(TYPE);
    });
  });

  describe("writing a batch", () => {
    it("creates the delivery and appends its event in one transaction", async () => {
      const { service, transaction, create, outbox } = setup({
        rows: [row(1), row(2)],
      });

      const result = await service.send(owner, TYPE, audience);

      expect(result.acceptedCount).toBe(2);
      expect(transaction).toHaveBeenCalledTimes(1);
      expect(create).toHaveBeenCalledTimes(2);
      expect(outbox.append).toHaveBeenCalledTimes(2);

      const writer = outbox.append.mock.calls[0][1];
      expect(writer).toBeDefined();
    });

    it("carries the figures the template needs, and no rendered body", async () => {
      const { service, create } = setup();

      await service.send(owner, TYPE, audience);

      const written = create.mock.calls[0][0].data;

      expect(written.context).toEqual({
        percent: 25,
        requiredCredits: 20,
        completedCredits: 5,
        deadline: "2026-12-31T00:00:00.000Z",
        detail: "",
        detailDate: null,
      });
      expect(written).not.toHaveProperty("body");
      expect(written).not.toHaveProperty("html");
    });

    it("stamps the bucket every delivery in the batch shares", async () => {
      const { service, create } = setup({ rows: [row(1), row(2)] });

      await service.send(owner, TYPE, audience);

      const buckets = create.mock.calls.map(
        (call) => call[0].data.cooldownBucket,
      );

      expect(new Set(buckets).size).toBe(1);
      expect(buckets[0]).toBe(cooldownBucketFor(new Date()));
    });
  });

  describe("who receives nothing", () => {
    it("skips a member whose account is not active", async () => {
      const { service, create } = setup({
        identities: [
          {
            id: "user-1",
            email: "member-1@example.test",
            fullName: "Member 1",
            emailVerifiedAt: new Date(),
            isActive: false,
          },
        ],
      });

      const result = await service.send(owner, TYPE, audience);

      expect(result.acceptedCount).toBe(0);
      expect(result.skipped[0]?.reason).toBe(
        AssociationMessageSkipReason.INACTIVE_ACCOUNT,
      );
      expect(create).not.toHaveBeenCalled();
    });

    it("skips a member with no verified email", async () => {
      const { service, create } = setup({
        identities: [
          {
            id: "user-1",
            email: "member-1@example.test",
            fullName: "Member 1",
            emailVerifiedAt: null,
            isActive: true,
          },
        ],
      });

      const result = await service.send(owner, TYPE, audience);

      expect(result.skipped[0]?.reason).toBe(
        AssociationMessageSkipReason.NO_VERIFIED_EMAIL,
      );
      expect(create).not.toHaveBeenCalled();
    });

    it("skips a selected member who is not in the list", async () => {
      const { service } = setup({ rows: [row(1)] });

      const result = await service.send(owner, TYPE, {
        section: SECTION,
        memberIds: ["member-1", "stranger"],
      });

      expect(result.acceptedCount).toBe(1);
      expect(result.skipped).toEqual([
        {
          memberId: "stranger",
          fullName: null,
          reason: AssociationMessageSkipReason.NOT_IN_LIST,
        },
      ]);
    });

    it("refuses a message that does not belong to the named list", async () => {
      const { service } = setup();

      expect(
        await refusal(
          service.send(owner, TYPE, {
            section: AssociationAttentionSection.NEW_JOINERS,
          }),
        ),
      ).toEqual({
        status: 400,
        code: AssociationMessageCode.MESSAGE_TYPE_UNKNOWN,
      });
    });

    it("refuses a batch larger than the cap", async () => {
      const { service } = setup({
        rows: Array.from({ length: 501 }, (_, index) => row(index)),
      });

      expect(await refusal(service.send(owner, TYPE, audience))).toEqual({
        status: 400,
        code: AssociationMessageCode.MESSAGE_BATCH_TOO_LARGE,
      });
    });

    it("refuses a send with nobody in the list at all", async () => {
      const { service } = setup({ rows: [] });

      expect(await refusal(service.send(owner, TYPE, audience))).toEqual({
        status: 400,
        code: AssociationMessageCode.MESSAGE_NO_RECIPIENTS,
      });
    });
  });

  describe("recipient language", () => {
    it("writes French for a French-speaking member", async () => {
      const { service, create } = setup({
        languages: [{ userId: "user-1", language: AppLanguage.FR }],
      });

      await service.send(owner, TYPE, audience);

      expect(create.mock.calls[0][0].data.language).toBe(AppLanguage.FR);
    });

    it("falls back to English when the member has stated no language", async () => {
      const { service, create } = setup({ languages: [] });

      await service.send(owner, TYPE, audience);

      expect(create.mock.calls[0][0].data.language).toBe(AppLanguage.EN);
    });

    it("renders the preview in the representative recipient's language", async () => {
      const { service } = setup({
        languages: [{ userId: "user-1", language: AppLanguage.FR }],
      });

      const preview = await service.preview(owner, TYPE, audience);

      expect(preview.language).toBe(AppLanguage.FR);
      expect(preview.subject).toContain("votre progression est en retard");
      expect(preview.body).toContain("Bonjour Member 1");
      expect(preview.recipientCount).toBe(1);
    });
  });

  describe("the preview", () => {
    it("reports the recipient count and the skips without writing anything", async () => {
      const { service, create, outbox } = setup({
        rows: [row(1), row(2)],
        recent: [{ memberId: "member-2" }],
      });

      const preview = await service.preview(owner, TYPE, audience);

      expect(preview.recipientCount).toBe(1);
      expect(preview.skippedCount).toBe(1);
      expect(preview.skipped[0]?.reason).toBe(
        AssociationMessageSkipReason.COOLDOWN,
      );
      expect(create).not.toHaveBeenCalled();
      expect(outbox.append).not.toHaveBeenCalled();
    });

    it("has nothing to render when nobody is eligible", async () => {
      const { service } = setup({ recent: [{ memberId: "member-1" }] });

      const preview = await service.preview(owner, TYPE, audience);

      expect(preview.subject).toBeNull();
      expect(preview.body).toBeNull();
      expect(preview.recipientCount).toBe(0);
    });
  });

  describe("history", () => {
    it("never returns the audience or the rendered body", async () => {
      const { service } = setup();
      const prisma = (
        service as unknown as {
          prisma: { associationMessageDelivery: { findMany: jest.Mock } };
        }
      ).prisma;

      prisma.associationMessageDelivery.findMany.mockResolvedValueOnce([
        {
          id: "delivery-1",
          state: AssociationMessageDeliveryState.SENT,
          sentAt: new Date("2026-09-05T00:00:00.000Z"),
          language: AppLanguage.EN,
          createdAt: new Date("2026-09-05T00:00:00.000Z"),
          skipReason: null,
          messageType: TYPE,
          failureReason: null,
          templateVersion: 1,
          member: {
            id: "member-1",
            memberNumber: "M-1",
            user: { fullName: "Member 1", email: "member-1@example.test" },
          },
        },
      ]);

      const history = await service.history(owner);

      expect(history.items[0]).not.toHaveProperty("audience");
      expect(history.items[0]).not.toHaveProperty("context");
      expect(history.items[0]?.state).toBe(
        AssociationMessageDeliveryState.SENT,
      );
    });
  });

  describe("suppressed email", () => {
    it("delivers nothing and reports every recipient with the reason", async () => {
      const { service, create, outbox } = setup({
        rows: [row(1), row(2), row(3)],
        suppressAllEmail: true,
      });

      const outcome = await service.send(owner, TYPE, audience);

      expect(outcome.acceptedCount).toBe(0);
      expect(outcome.skippedCount).toBe(3);
      expect(
        outcome.skipped.every(
          (one) => one.reason === AssociationMessageSkipReason.EMAIL_SUPPRESSED,
        ),
      ).toBe(true);
      expect(create).not.toHaveBeenCalled();
      expect(outbox.append).not.toHaveBeenCalled();
    });

    it("never asks the identity port for an address it may not use", async () => {
      const { service, identity } = setup({
        rows: [row(1)],
        suppressAllEmail: true,
      });

      await service.send(owner, TYPE, audience);

      expect(identity.recipients).not.toHaveBeenCalled();
    });

    it("shows the preview the same suppression rather than a body", async () => {
      const { service } = setup({ rows: [row(1)], suppressAllEmail: true });

      const preview = await service.preview(owner, TYPE, audience);

      expect(preview.recipientCount).toBe(0);
      expect(preview.skippedCount).toBe(1);
      expect(preview.body).toBe(null);
    });
  });
});
