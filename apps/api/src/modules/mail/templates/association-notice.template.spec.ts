import { AppLanguage, AssociationMessageType } from "@prisma/client";

import { buildAssociationLifecycleEmail } from "@mail/templates/association-lifecycle.template";
import { buildAssociationMessageEmail } from "@mail/templates/association-message.template";

import {
  type TAssociationLifecycleInput,
  type TAssociationMessageInput,
} from "@mail/types/mail-service.types";

const dashboardUrl = "https://app.loopskey.test/dashboard/professional";
const requirementsUrl = `${dashboardUrl}?tab=cpd-pdu-progress`;

const messageBase = {
  appName: "LoopsKey",
  memberName: "Ada",
  dashboardUrl,
  requirementsUrl,
  supportEmail: "support@loopskey.test",
  associationName: "Institute of Practice",
};

const lifecycleBase = {
  appName: "LoopsKey",
  memberName: "Ada",
  supportEmail: "support@loopskey.test",
  associationName: "Institute of Practice",
  actionUrl: `${dashboardUrl}?tab=cpd-pdu-progress&requirement=association%3Areq-1`,
};

const NOW = new Date("2026-10-15T09:00:00.000Z");

const message = (
  language: AppLanguage,
  fields: Record<string, unknown> & {
    messageType: TAssociationMessageInput["messageType"];
  },
) =>
  buildAssociationMessageEmail(
    { ...messageBase, language, ...fields } as TAssociationMessageInput,
    { now: NOW },
  );

const lifecycle = (
  language: AppLanguage,
  fields: Record<string, unknown> & {
    messageType: TAssociationLifecycleInput["messageType"];
  },
) =>
  buildAssociationLifecycleEmail({
    ...lifecycleBase,
    language,
    ...fields,
  } as TAssociationLifecycleInput);

const paragraphsOf = (text: string) => text.split("\n\n");

describe("the association notices, template version 2", () => {
  describe("welcome (item 13)", () => {
    it("reads the English catalogue copy and links to the dashboard", () => {
      const email = message(AppLanguage.EN, {
        messageType: AssociationMessageType.WELCOME,
      });

      expect(email.subject).toBe(
        "Welcome to Institute of Practice on LoopsKey",
      );
      expect(paragraphsOf(email.text)).toEqual([
        "Welcome, Ada!",
        "Hi Ada,",
        "You're officially part of Institute of Practice on LoopsKey. Your dashboard is where you'll track your continuing education requirements, see what you've already completed, and discover recommended learning.",
        "Explore your dashboard whenever you're ready.",
        `Go to your dashboard: ${dashboardUrl}`,
        "LoopsKey",
      ]);
    });

    it("reads the French catalogue copy", () => {
      const email = message(AppLanguage.FR, {
        messageType: AssociationMessageType.WELCOME,
      });

      expect(email.subject).toBe(
        "Bienvenue chez Institute of Practice sur LoopsKey",
      );
      expect(paragraphsOf(email.text)).toEqual([
        "Bienvenue, Ada !",
        "Bonjour Ada,",
        "Vous faites désormais partie de Institute of Practice sur LoopsKey. Votre tableau de bord vous permet de suivre vos exigences de formation continue, de voir ce que vous avez déjà accompli et de découvrir des formations recommandées.",
        "Explorez votre tableau de bord quand vous serez prêt(e).",
        `Accéder à mon tableau de bord: ${dashboardUrl}`,
        "LoopsKey",
      ]);
    });

    it("makes no claim about urgency", () => {
      for (const language of [AppLanguage.EN, AppLanguage.FR]) {
        const { text } = message(language, {
          messageType: AssociationMessageType.WELCOME,
        });

        expect(text).not.toMatch(/nothing urgent|rien d'urgent/i);
      }
    });
  });

  describe("behind threshold (item 17)", () => {
    const fields = {
      percent: 25,
      requiredCredits: 20,
      completedCredits: 5,
      messageType: AssociationMessageType.BEHIND_THRESHOLD,
    };

    it("states the figures and the earliest deadline in English", () => {
      const email = message(AppLanguage.EN, {
        ...fields,
        deadline: new Date("2026-12-31T00:00:00.000Z"),
      });

      expect(email.subject).toBe("Your progress with Institute of Practice");
      expect(paragraphsOf(email.text).slice(0, 4)).toEqual([
        "You're behind on your requirements",
        "Hi Ada,",
        "You've completed 5 of the 20 credits Institute of Practice requires — that's 25%.",
        "Your earliest deadline is 31 December 2026.",
      ]);
    });

    it("uses the no-deadline sentence when none is set", () => {
      const email = message(AppLanguage.EN, { ...fields, deadline: null });

      expect(email.text).toContain(
        "There's no immediate deadline, but the sooner you start, the easier it'll be.",
      );
      expect(email.text).not.toContain("earliest deadline");
    });

    it("localises numbers, the date and the percent sign in French", () => {
      const email = message(AppLanguage.FR, {
        ...fields,
        completedCredits: 1250,
        deadline: new Date("2026-12-31T00:00:00.000Z"),
      });

      expect(email.subject).toBe(
        "Votre progression chez Institute of Practice",
      );
      expect(email.text).toContain(
        `Vous avez obtenu ${(1250).toLocaleString("fr-FR")} crédits sur les 20 exigés par Institute of Practice, soit 25 %.`,
      );
      expect(email.text).toContain(
        "Votre échéance la plus proche est le 31 décembre 2026.",
      );
    });

    it("uses the French no-deadline sentence when none is set", () => {
      const email = message(AppLanguage.FR, { ...fields, deadline: null });

      expect(email.text).toContain(
        "Aucune échéance immédiate, mais plus tôt vous commencez, plus ce sera simple.",
      );
    });

    it("prints a UTC calendar date whatever the server time zone", () => {
      const email = message(AppLanguage.EN, {
        ...fields,
        deadline: new Date("2026-03-01T00:00:00.000Z"),
      });

      expect(email.text).toContain("Your earliest deadline is 1 March 2026.");
    });

    it("sends the member to the requirements view", () => {
      const email = message(AppLanguage.EN, { ...fields, deadline: null });

      expect(email.text).toContain(`See what's missing: ${requirementsUrl}`);
      expect(email.html).toContain(`href="${requirementsUrl}"`);
    });
  });

  describe("category behind (item 18)", () => {
    const fields = {
      percent: 40,
      categoryName: "Leadership",
      messageType: AssociationMessageType.CATEGORY_BEHIND,
    };

    it("reads the English catalogue copy", () => {
      const email = message(AppLanguage.EN, fields);

      expect(email.subject).toBe("Leadership needs your attention");
      expect(paragraphsOf(email.text).slice(0, 4)).toEqual([
        "You're furthest behind in Leadership",
        "Hi Ada,",
        "Of all the requirements Institute of Practice has set for you, Leadership is where you have the most ground to cover — 40% complete.",
        "Your dashboard lists the learning that counts toward it.",
      ]);
    });

    it("reads the French catalogue copy", () => {
      const email = message(AppLanguage.FR, fields);

      expect(email.subject).toBe("Leadership demande votre attention");
      expect(email.text).toContain(
        "C'est en Leadership que vous avez le plus de retard",
      );
      expect(email.text).toContain(
        "Parmi les exigences fixées par Institute of Practice, Leadership est le domaine où vous avez le plus de progrès à faire — 40 % complété.",
      );
    });

    it("sends the member to the view that lists the learning", () => {
      const email = message(AppLanguage.EN, fields);

      expect(email.text).toContain(
        `See recommended learning: ${requirementsUrl}`,
      );
    });

    it("falls back to the dashboard when no requirements link is given", () => {
      const email = buildAssociationMessageEmail(
        {
          ...messageBase,
          ...fields,
          requirementsUrl: undefined,
          language: AppLanguage.EN,
        } as TAssociationMessageInput,
        { now: NOW },
      );

      expect(email.text).toContain(`See recommended learning: ${dashboardUrl}`);
    });
  });

  describe("certificate (item 19)", () => {
    const fields = {
      certificateTitle: "First Aid",
      messageType: AssociationMessageType.CERTIFICATE_EXPIRING,
    };

    it("says a future certificate is expiring, with the date", () => {
      const email = message(AppLanguage.EN, {
        ...fields,
        expiresOn: new Date("2026-11-01T00:00:00.000Z"),
      });

      expect(email.subject).toBe("Your First Aid certificate is expiring");
      expect(paragraphsOf(email.text).slice(0, 4)).toEqual([
        "Time to renew your certificate",
        "Hi Ada,",
        "Your First Aid certificate expires on 1 November 2026.",
        "Institute of Practice counts it toward your requirements while it's valid — renew it to keep your record up to date.",
      ]);
      expect(email.text).not.toContain("has expired");
    });

    it("says so, in the subject too, when the date has passed", () => {
      const email = message(AppLanguage.EN, {
        ...fields,
        expiresOn: new Date("2026-09-30T00:00:00.000Z"),
      });

      expect(email.subject).toBe("Your First Aid certificate has expired");
      expect(email.text).toContain("Your First Aid certificate has expired.");
      expect(email.text).not.toContain("expires on");
    });

    it("treats the expiry day itself as still valid", () => {
      const email = message(AppLanguage.EN, {
        ...fields,
        expiresOn: new Date("2026-10-15T00:00:00.000Z"),
      });

      expect(email.subject).toBe("Your First Aid certificate is expiring");
    });

    it("does the same in French", () => {
      const expiring = message(AppLanguage.FR, {
        ...fields,
        expiresOn: new Date("2026-11-01T00:00:00.000Z"),
      });
      const expired = message(AppLanguage.FR, {
        ...fields,
        expiresOn: new Date("2026-09-30T00:00:00.000Z"),
      });

      expect(expiring.subject).toBe(
        "Votre certificat First Aid arrive à échéance",
      );
      expect(expiring.text).toContain(
        "Votre certificat First Aid expire le 1 novembre 2026.",
      );
      expect(expired.subject).toBe("Votre certificat First Aid a expiré");
      expect(expired.text).toContain("Votre certificat First Aid a expiré.");
    });

    it("never calls a certificate expired when the date is missing", () => {
      expect(() =>
        message(AppLanguage.EN, { ...fields, expiresOn: null }),
      ).toThrow(/expiry date/);
    });

    it("links to the dashboard", () => {
      const email = message(AppLanguage.EN, {
        ...fields,
        expiresOn: new Date("2026-11-01T00:00:00.000Z"),
      });

      expect(email.text).toContain(`Go to your dashboard: ${dashboardUrl}`);
    });
  });

  describe("group added (item 14)", () => {
    const fields = {
      groupTitle: "Level 2",
      messageType: AssociationMessageType.GROUP_ADDED,
    };

    it("reads the catalogue copy in English", () => {
      const email = lifecycle(AppLanguage.EN, fields);

      expect(email.subject).toBe(
        "You've joined Level 2 at Institute of Practice",
      );
      expect(paragraphsOf(email.text).slice(0, 4)).toEqual([
        "You're now part of Level 2",
        "Hi Ada,",
        "Institute of Practice added you to the Level 2 group.",
        "Any requirements or recommended learning set for this group now appear on your dashboard.",
      ]);
      expect(email.text).toContain("View your requirements: ");
    });

    it("reads the catalogue copy in French", () => {
      const email = lifecycle(AppLanguage.FR, fields);

      expect(email.subject).toBe(
        "Vous avez rejoint Level 2 chez Institute of Practice",
      );
      expect(email.text).toContain("Vous faites maintenant partie de Level 2");
      expect(email.text).toContain(
        "Institute of Practice vous a ajouté au groupe Level 2.",
      );
      expect(email.text).toContain("Voir mes exigences: ");
    });
  });

  describe("requirement assigned (item 15)", () => {
    const fields = {
      requirementName: "Ethics 101",
      messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
    };

    it("states the due date when there is one", () => {
      const email = lifecycle(AppLanguage.EN, {
        ...fields,
        deadline: new Date("2027-01-15T00:00:00.000Z"),
      });

      expect(email.subject).toBe("New requirement: Ethics 101");
      expect(paragraphsOf(email.text).slice(0, 5)).toEqual([
        "A new requirement has been assigned to you",
        "Hi Ada,",
        'Institute of Practice has assigned you a new requirement: "Ethics 101".',
        "Due 15 January 2027.",
        "Open it to see what counts toward it and what evidence is expected.",
      ]);
    });

    it("says there is no deadline, and not both, when there is none", () => {
      const email = lifecycle(AppLanguage.EN, { ...fields, deadline: null });

      expect(email.text).toContain("No fixed deadline.");
      expect(email.text).not.toContain("Due ");
    });

    it("reads in French with the right deadline sentence", () => {
      const due = lifecycle(AppLanguage.FR, {
        ...fields,
        deadline: new Date("2027-01-15T00:00:00.000Z"),
      });
      const open = lifecycle(AppLanguage.FR, { ...fields, deadline: null });

      expect(due.subject).toBe("Nouvelle exigence : Ethics 101");
      expect(due.text).toContain(
        "Institute of Practice vous a attribué une nouvelle exigence : « Ethics 101 ».",
      );
      expect(due.text).toContain("À compléter avant le 15 janvier 2027.");
      expect(open.text).toContain("Aucune échéance fixe.");
      expect(open.text).not.toContain("À compléter");
    });

    it("keeps the requirement deep link on the button", () => {
      const email = lifecycle(AppLanguage.EN, { ...fields, deadline: null });

      expect(email.html).toContain(
        `href="${lifecycleBase.actionUrl.replaceAll("&", "&amp;")}"`,
      );
      expect(email.html).toContain(">Open the requirement</a>");
    });
  });

  describe("learning content assigned (item 16)", () => {
    const fields = {
      contentTitle: "Intro to Audit",
      messageType: AssociationMessageType.LEARNING_CONTENT_ASSIGNED,
    };

    it("names the requirement it counts toward when there is one", () => {
      const email = lifecycle(AppLanguage.EN, {
        ...fields,
        requirementName: "Ethics 101",
      });

      expect(email.subject).toBe("New recommended learning: Intro to Audit");
      expect(paragraphsOf(email.text).slice(0, 4)).toEqual([
        "New learning recommended for you",
        "Hi Ada,",
        'Institute of Practice recommends "Intro to Audit" for you.',
        'This counts toward "Ethics 101".',
      ]);
    });

    it("uses the fallback sentence, and only it, without a requirement", () => {
      const email = lifecycle(AppLanguage.EN, {
        ...fields,
        requirementName: null,
      });

      expect(email.text).toContain(
        "You'll find it alongside your other recommendations.",
      );
      expect(email.text).not.toContain("This counts toward");
    });

    it("reads in French in both branches", () => {
      const counted = lifecycle(AppLanguage.FR, {
        ...fields,
        requirementName: "Ethics 101",
      });
      const plain = lifecycle(AppLanguage.FR, {
        ...fields,
        requirementName: null,
      });

      expect(counted.subject).toBe(
        "Nouvelle formation recommandée : Intro to Audit",
      );
      expect(counted.text).toContain(
        "Institute of Practice vous recommande « Intro to Audit ».",
      );
      expect(counted.text).toContain(
        "Elle compte pour l'exigence « Ethics 101 ».",
      );
      expect(plain.text).toContain(
        "Vous la retrouverez avec vos autres recommandations.",
      );
      expect(plain.text).not.toContain("Elle compte");
    });
  });

  describe("every notice", () => {
    const notices: Array<[string, () => ReturnType<typeof message>]> = [
      [
        "welcome",
        () =>
          message(AppLanguage.EN, {
            messageType: AssociationMessageType.WELCOME,
          }),
      ],
      [
        "behind",
        () =>
          message(AppLanguage.FR, {
            percent: 10,
            deadline: null,
            requiredCredits: 20,
            completedCredits: 2,
            messageType: AssociationMessageType.BEHIND_THRESHOLD,
          }),
      ],
      [
        "category",
        () =>
          message(AppLanguage.EN, {
            percent: 10,
            categoryName: "Ethics",
            messageType: AssociationMessageType.CATEGORY_BEHIND,
          }),
      ],
      [
        "requirement",
        () =>
          lifecycle(AppLanguage.FR, {
            deadline: null,
            requirementName: "Ethics",
            messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
          }),
      ],
    ];

    it.each(notices)(
      "%s has no placeholder or editorial text left",
      (_, build) => {
        const { html, text, subject } = build();

        for (const value of [html, text, subject]) {
          expect(value).not.toMatch(/\{[A-Za-z]+\}|\[button\]|undefined|null/);
          expect(value).not.toContain("یا");
        }
      },
    );

    it.each(notices)("%s keeps the html and the text in step", (_, build) => {
      const { html, text } = build();
      const visible = html
        .replace(/<[^>]+>/g, "\n")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      for (const line of text.split("\n").filter(Boolean))
        if (!line.includes("http"))
          expect(visible.join(" ")).toContain(
            line.replaceAll("&", "&amp;").replaceAll("'", "&#039;"),
          );
    });
  });

  it("escapes user-controlled names in the html and keeps the subject on one line", () => {
    const email = message(AppLanguage.EN, {
      memberName: "<b>Ada</b>",
      categoryName: "Lead\r\nBcc: x@y.test",
      percent: 5,
      messageType: AssociationMessageType.CATEGORY_BEHIND,
    });

    expect(email.html).not.toContain("<b>Ada</b>");
    expect(email.html).toContain("&lt;b&gt;Ada&lt;/b&gt;");
    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.subject).toBe("Lead Bcc: x@y.test needs your attention");
  });

  it("refuses a link that is not a plain http(s) url", () => {
    expect(() =>
      message(AppLanguage.EN, {
        dashboardUrl: "javascript:alert(1)",
        messageType: AssociationMessageType.WELCOME,
      }),
    ).toThrow();
  });
});
