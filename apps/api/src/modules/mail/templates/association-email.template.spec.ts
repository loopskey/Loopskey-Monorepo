import {
  buildAssociationActivationEmail,
  buildAssociationMemberInvitationEmail,
  buildAssociationPasswordChangedEmail,
  buildAssociationRejectionEmail,
  buildAssociationSubmittedEmail,
} from "./association-email.template";

const invitationUrl =
  "https://app.example.com/auth/association/join?token=abc-DEF_123";

const base = {
  appName: "LoopsKey",
  associationName: "Institute <of> Practice",
  supportEmail: "support@example.com",
};

const invitation = () =>
  buildAssociationMemberInvitationEmail({
    ...base,
    memberName: "Ada Member",
    invitationUrl,
    expiresInMinutes: 60,
  });

describe("Association email templates", () => {
  describe("application received (item 8)", () => {
    it("uses the catalogue copy", () => {
      const email = buildAssociationSubmittedEmail(base);

      expect(email.subject).toBe("We've received your application");
      expect(email.text).toContain(
        "Thanks for applying, Institute <of> Practice",
      );
      expect(email.text).toContain(
        "Thanks for submitting an application for Institute <of> Practice on LoopsKey.",
      );
    });
  });

  describe("application rejected (item 9)", () => {
    it("uses the catalogue copy and the reason", () => {
      const email = buildAssociationRejectionEmail({
        ...base,
        reason: "Missing charter.",
      });

      expect(email.subject).toBe("An update on your LoopsKey application");
      expect(email.text).toContain("Reason: Missing charter.");
      expect(email.text).toContain(
        "After reviewing your application for Institute <of> Practice, we're not able to approve it at this time.",
      );
    });
  });

  describe("activation (item 10)", () => {
    const activationUrl = "https://app.example.com/activate?token=t-1_2";
    const email = buildAssociationActivationEmail({
      ...base,
      activationUrl,
      username: "owner@example.com",
      expiresInMinutes: 30,
      loginUrl: "https://app.example.com/auth/association",
    });

    it("says an account was created for the recipient", () => {
      expect(email.subject).toBe("Activate your LoopsKey account");
      expect(email.text).toContain(
        "Good news — an account was created for you with Institute <of> Practice.",
      );
      expect(email.text).toContain(
        "Your Institute <of> Practice account is ready",
      );
    });

    it("keeps the single-use destination and the real expiry", () => {
      expect(email.html).toContain(`href="${activationUrl}"`);
      expect(email.text).toContain(`Set your password: ${activationUrl}`);
      expect(email.text).toContain("valid for 30 minutes");
    });
  });

  describe("password changed (item 11)", () => {
    it("uses the catalogue copy", () => {
      const email = buildAssociationPasswordChangedEmail(base);

      expect(email.subject).toBe("Your LoopsKey password was changed");
      expect(email.text).toContain(
        "This confirms that the password for your Institute <of> Practice account was just changed.",
      );
    });
  });

  describe("member invitation (item 12)", () => {
    it("uses the catalogue subject, heading and body", () => {
      const email = invitation();

      expect(email.subject).toBe(
        "Institute <of> Practice invited you to join LoopsKey",
      );
      expect(email.text).toContain("You're invited, Ada Member!");
      expect(email.text).toContain("Hi Ada Member,");
      expect(email.text).toContain(
        "Institute <of> Practice has invited you to join their team on LoopsKey, where you'll track your continuing education progress.",
      );
      expect(email.text).toContain(
        "This invitation link is valid for 60 minutes and can only be used once.",
      );
      expect(email.text).toContain("Questions? Contact support@example.com.");
    });

    it("puts the link on its own line so no punctuation can join the token", () => {
      expect(invitation().text.split("\n")).toContain(
        `Accept the invitation: ${invitationUrl}`,
      );
    });

    it("links the call to action to the exact invitation url", () => {
      expect(invitation().html).toContain(`href="${invitationUrl}"`);
      expect(invitation().html).toContain(">Accept the invitation</a>");
    });

    it("escapes association data in the html", () => {
      expect(invitation().html).toContain("Institute &lt;of&gt; Practice");
      expect(invitation().html).not.toContain("Institute <of> Practice");
    });
  });
});
