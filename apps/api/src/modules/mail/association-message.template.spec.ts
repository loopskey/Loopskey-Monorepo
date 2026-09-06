import { AppLanguage, AssociationMessageType } from "@prisma/client";

import { buildAssociationMessageEmail } from "@mail/association-message.template";
import { type TAssociationMessageInput } from "@mail/mail-service.type";

const base = {
  appName: "LoopsKey",
  memberName: "Member One",
  dashboardUrl: "https://app.loopskey.test/dashboard/professional",
  supportEmail: "support@loopskey.test",
  associationName: "Institute of Practice",
};

const input = (
  overrides: Partial<TAssociationMessageInput> &
    Pick<TAssociationMessageInput, "messageType">,
  language: AppLanguage = AppLanguage.EN,
) => ({ ...base, language, ...overrides }) as TAssociationMessageInput;

describe("the association message templates", () => {
  describe("every type in both languages", () => {
    const types = [
      AssociationMessageType.WELCOME,
      AssociationMessageType.BEHIND_THRESHOLD,
      AssociationMessageType.CATEGORY_BEHIND,
      AssociationMessageType.CERTIFICATE_EXPIRING,
    ] as const;

    const forType = (
      messageType: (typeof types)[number],
      language: AppLanguage,
    ) =>
      buildAssociationMessageEmail(
        input(
          {
            messageType,
            percent: 25,
            deadline: new Date("2026-12-31T00:00:00.000Z"),
            requiredCredits: 20,
            completedCredits: 5,
            categoryName: "Leadership",
            expiresOn: new Date("2026-11-01T00:00:00.000Z"),
            certificateTitle: "First Aid",
          } as Partial<TAssociationMessageInput> &
            Pick<TAssociationMessageInput, "messageType">,
          language,
        ),
      );

    it.each(types)("names the association in %s", (messageType) => {
      for (const language of [AppLanguage.EN, AppLanguage.FR]) {
        const built = forType(messageType, language);

        expect(built.subject).toContain("Institute of Practice");
        expect(built.text).toContain("Institute of Practice");
        expect(built.html).toContain("Institute of Practice");
      }
    });

    it.each(types)(
      "carries the member's name and a link in %s",
      (messageType) => {
        for (const language of [AppLanguage.EN, AppLanguage.FR]) {
          const built = forType(messageType, language);

          expect(built.text).toContain("Member One");
          expect(built.text).toContain(base.dashboardUrl);
          expect(built.html).toContain(base.dashboardUrl);
        }
      },
    );

    it.each(types)(
      "differs between the two languages for %s",
      (messageType) => {
        expect(forType(messageType, AppLanguage.EN).subject).not.toBe(
          forType(messageType, AppLanguage.FR).subject,
        );
      },
    );
  });

  describe("the figures each type states", () => {
    it("states credits, percent and deadline when a member is behind", () => {
      const built = buildAssociationMessageEmail(
        input({
          messageType: AssociationMessageType.BEHIND_THRESHOLD,
          percent: 25,
          deadline: new Date("2026-12-31T00:00:00.000Z"),
          requiredCredits: 20,
          completedCredits: 5,
        }),
      );

      expect(built.text).toContain("5 of the 20 credits");
      expect(built.text).toContain("25%");
      expect(built.text).toContain("31 December 2026");
    });

    it("does not invent a deadline when the member has none", () => {
      const built = buildAssociationMessageEmail(
        input({
          messageType: AssociationMessageType.BEHIND_THRESHOLD,
          percent: 25,
          deadline: null,
          requiredCredits: 20,
          completedCredits: 5,
        }),
      );

      expect(built.text).not.toContain("deadline is");
      expect(built.text).toContain("still time");
    });

    it("names the weak category", () => {
      const built = buildAssociationMessageEmail(
        input({
          messageType: AssociationMessageType.CATEGORY_BEHIND,
          percent: 10,
          categoryName: "Leadership",
        }),
      );

      expect(built.subject).toContain("Leadership");
      expect(built.text).toContain("Leadership is the area");
    });

    it("says a certificate has expired rather than naming no date", () => {
      const built = buildAssociationMessageEmail(
        input({
          messageType: AssociationMessageType.CERTIFICATE_EXPIRING,
          expiresOn: null,
          certificateTitle: "First Aid",
        }),
      );

      expect(built.text).toContain("has expired");
    });

    it("formats French numbers and dates for a French recipient", () => {
      const built = buildAssociationMessageEmail(
        input(
          {
            messageType: AssociationMessageType.BEHIND_THRESHOLD,
            percent: 25.5,
            deadline: new Date("2026-12-31T00:00:00.000Z"),
            requiredCredits: 20,
            completedCredits: 5,
          },
          AppLanguage.FR,
        ),
      );

      expect(built.text).toContain("25,5");
      expect(built.text).toContain("31 décembre 2026");
    });
  });

  describe("what never reaches the recipient", () => {
    it("escapes an association name carrying markup", () => {
      const built = buildAssociationMessageEmail(
        input({
          messageType: AssociationMessageType.WELCOME,
          associationName: "<script>alert(1)</script>",
        } as Partial<TAssociationMessageInput> &
          Pick<TAssociationMessageInput, "messageType">),
      );

      expect(built.html).not.toContain("<script>");
      expect(built.html).toContain("&lt;script&gt;");
    });

    it("escapes a member name carrying markup", () => {
      const built = buildAssociationMessageEmail(
        input({
          messageType: AssociationMessageType.WELCOME,
          memberName: '"><img src=x onerror=1>',
        } as Partial<TAssociationMessageInput> &
          Pick<TAssociationMessageInput, "messageType">),
      );

      expect(built.html).not.toContain("<img");
    });
  });
});
