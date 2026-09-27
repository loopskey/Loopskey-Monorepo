import { AppLanguage, AssociationMessageType } from "@prisma/client";

import { buildAssociationLifecycleEmail } from "@mail/association-lifecycle.template";
import { type TAssociationLifecycleInput } from "@mail/mail-service.type";

const base = {
  appName: "LoopsKey",
  memberName: "Member <One>",
  actionUrl: "https://app.loopskey.test/dashboard/professional?tab=a&b=c",
  supportEmail: "support@loopskey.test",
  associationName: "Institute & Practice",
};

const inputs: TAssociationLifecycleInput[] = [AppLanguage.EN, AppLanguage.FR]
  .map((language) => [
    {
      ...base,
      language,
      messageType: AssociationMessageType.GROUP_ADDED,
      groupTitle: "North <script>",
    } as const,
    {
      ...base,
      language,
      messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
      requirementName: 'Annual "CPD"',
      deadline: new Date("2026-12-31T00:00:00.000Z"),
    } as const,
    {
      ...base,
      language,
      messageType: AssociationMessageType.LEARNING_CONTENT_ASSIGNED,
      contentTitle: "Ethics <b>101</b>",
      requirementName: null,
    } as const,
  ])
  .flat();

describe("the association lifecycle templates", () => {
  it.each(inputs.map((input) => [input.messageType, input.language, input]))(
    "%s in %s has a subject, a text alternative and the call to action",
    (_type, _language, input) => {
      const email = buildAssociationLifecycleEmail(input);

      expect(email.subject.length).toBeGreaterThan(0);
      expect(email.text).toContain(base.actionUrl);
      expect(email.html).toContain(
        "https://app.loopskey.test/dashboard/professional?tab=a&amp;b=c",
      );
    },
  );

  it.each(inputs.map((input) => [input.messageType, input.language, input]))(
    "%s in %s escapes every dynamic value in the html",
    (_type, _language, input) => {
      const { html } = buildAssociationLifecycleEmail(input);

      expect(html).not.toMatch(/<script>|<b>101<\/b>|Member <One>/);
      expect(html).toContain("Institute &amp; Practice");
    },
  );

  it("states the deadline when the requirement has one", () => {
    const email = buildAssociationLifecycleEmail({
      ...base,
      language: AppLanguage.EN,
      messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
      requirementName: "Annual CPD",
      deadline: new Date("2026-12-31T00:00:00.000Z"),
    });

    expect(email.text).toContain("31 December 2026");
  });

  it("says so when the requirement has no deadline", () => {
    const email = buildAssociationLifecycleEmail({
      ...base,
      language: AppLanguage.EN,
      messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
      requirementName: "Annual CPD",
      deadline: null,
    });

    expect(email.text).toContain("no fixed deadline");
  });

  it("names the requirement a learning item counts toward", () => {
    const email = buildAssociationLifecycleEmail({
      ...base,
      language: AppLanguage.FR,
      messageType: AssociationMessageType.LEARNING_CONTENT_ASSIGNED,
      contentTitle: "Éthique",
      requirementName: "CPD annuel",
    });

    expect(email.text).toContain("« CPD annuel »");
  });
});
