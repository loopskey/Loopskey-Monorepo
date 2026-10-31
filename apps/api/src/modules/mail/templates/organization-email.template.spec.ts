import {
  buildOrganizationApprovalEmail,
  buildOrganizationPasswordChangedEmail,
  buildOrganizationRejectionEmail,
  buildOrganizationSubmittedEmail,
} from "./organization-email.template";

const base = {
  appName: "LoopsKey",
  organizationName: "Example & Partners",
  supportEmail: "support@example.com",
};

const activationUrl = "https://app.example.com/activate?token=secret-1_2";
const loginUrl = "https://app.example.com/auth/organization";

describe("Organization email templates", () => {
  describe("application received (item 4)", () => {
    const email = buildOrganizationSubmittedEmail(base);

    it("uses the catalogue subject, heading and body", () => {
      expect(email.subject).toBe("We've received your application");
      expect(email.text).toContain("Thanks for applying, Example & Partners");
      expect(email.text).toContain(
        "Thanks for submitting an application for Example & Partners on LoopsKey.",
      );
      expect(email.text).toContain(
        "Our team is reviewing it now — we'll email you as soon as a decision is made.",
      );
      expect(email.text).toContain(
        "Questions in the meantime? Contact support@example.com.",
      );
    });

    it("escapes the organization name in the html", () => {
      expect(email.html).toContain("Example &amp; Partners");
      expect(email.html).not.toContain("Example & Partners");
    });

    it("has no call to action", () => {
      expect(email.html).not.toContain("display:inline-block");
    });
  });

  describe("application rejected (item 5)", () => {
    const email = buildOrganizationRejectionEmail({
      ...base,
      reason: "Required accreditation was not provided.",
    });

    it("uses the catalogue copy and the applicant-facing reason", () => {
      expect(email.subject).toBe("An update on your LoopsKey application");
      expect(email.text).toContain("Your application wasn't approved");
      expect(email.text).toContain(
        "After reviewing your application for Example & Partners, we're not able to approve it at this time.",
      );
      expect(email.text).toContain(
        "Reason: Required accreditation was not provided.",
      );
      expect(email.text).toContain(
        "Have questions, or want to resubmit? Contact support@example.com.",
      );
    });

    it("keeps a reason with line breaks on one line", () => {
      const forged = buildOrganizationRejectionEmail({
        ...base,
        reason: "No.\r\nBcc: attacker@example.com",
      });

      expect(forged.text).toContain("Reason: No. Bcc: attacker@example.com");
    });
  });

  describe("activation (item 6)", () => {
    const email = buildOrganizationApprovalEmail({
      ...base,
      activationUrl,
      loginUrl,
      username: "admin@example.com",
      expiresInMinutes: 60,
    });

    it("uses the catalogue subject, heading and approval line", () => {
      expect(email.subject).toBe("Activate your LoopsKey account");
      expect(email.text).toContain("Your Example & Partners account is ready");
      expect(email.text).toContain(
        "Good news — your application for Example & Partners has been approved.",
      );
      expect(email.text).toContain("Username: admin@example.com");
    });

    it("keeps the single-use destination in the button and the text", () => {
      expect(email.html).toContain(`href="${activationUrl}"`);
      expect(email.html).toContain(">Set your password</a>");
      expect(email.text).toContain(`Set your password: ${activationUrl}`);
    });

    it("states the real expiry and the sign-in address", () => {
      expect(email.text).toContain(
        "This link is valid for 60 minutes and can only be used once, so don't share it with anyone.",
      );
      expect(email.text).toContain(
        `Once you've set your password, sign in at ${loginUrl}.`,
      );
      expect(email.html).toContain(`href="${loginUrl}"`);
      expect(email.text).toContain("Need help? Contact support@example.com.");
    });

    it("never carries a password", () => {
      expect(email.text).not.toMatch(/temporary password/i);
    });

    it("refuses an activation link that is not a plain http(s) url", () => {
      expect(() =>
        buildOrganizationApprovalEmail({
          ...base,
          loginUrl,
          username: "a@b.test",
          expiresInMinutes: 60,
          activationUrl: "javascript:alert(1)",
        }),
      ).toThrow();
    });
  });

  describe("password changed (item 7)", () => {
    const email = buildOrganizationPasswordChangedEmail(base);

    it("uses the catalogue copy", () => {
      expect(email.subject).toBe("Your LoopsKey password was changed");
      expect(email.text).toContain("Your password was changed successfully");
      expect(email.text).toContain(
        "This confirms that the password for your Example & Partners account was just changed.",
      );
      expect(email.text).toContain(
        "If you made this change, no further action is needed.",
      );
      expect(email.text).toContain(
        "If you didn't, contact support@example.com immediately to secure your account.",
      );
    });
  });
});
