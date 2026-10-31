import { OtpPurpose } from "@prisma/client";

import { buildOtpEmailTemplate } from "@mail/templates/otp-email.template";

const build = (purpose: OtpPurpose, overrides = {}) =>
  buildOtpEmailTemplate({
    purpose,
    code: "482913",
    appName: "LoopsKey",
    expiresInMinutes: 10,
    supportEmail: "support@loopskey.test",
    ...overrides,
  });

describe("the one-time code emails", () => {
  describe("sign-up (item 1)", () => {
    const email = build(OtpPurpose.SIGNUP);

    it("uses the catalogue subject and heading", () => {
      expect(email.subject).toBe("Your LoopsKey verification code");
      expect(email.html).toContain("Confirm your email to get started");
    });

    it("carries the real code and the configured expiry", () => {
      expect(email.text).toContain("482913");
      expect(email.html).toContain(">482913<");
      expect(email.text).toContain(
        "This code expires in 10 minutes — please don't share it with anyone.",
      );
    });

    it("tells a stranger they can ignore it, with no support line", () => {
      expect(email.text).toContain(
        "Didn't sign up for LoopsKey? You can safely ignore this email.",
      );
      expect(email.text).not.toContain("support@loopskey.test");
    });
  });

  describe("password reset (item 2)", () => {
    const email = build(OtpPurpose.RESET_PASSWORD, { expiresInMinutes: 15 });

    it("uses the catalogue subject, heading and expiry", () => {
      expect(email.subject).toBe("Your LoopsKey password reset code");
      expect(email.html).toContain("Reset your password");
      expect(email.text).toContain("This code expires in 15 minutes.");
    });

    it("points at the configured support address", () => {
      expect(email.text).toContain(
        "Didn't request this? Your password hasn't changed — you can ignore this email, or contact support@loopskey.test if you're concerned.",
      );
      expect(email.html).toContain('href="mailto:support@loopskey.test"');
    });
  });

  describe("email change (item 3)", () => {
    const email = build(OtpPurpose.CHANGE_EMAIL);

    it("uses the catalogue copy and the configured support address", () => {
      expect(email.subject).toBe("Confirm your new LoopsKey email address");
      expect(email.html).toContain("Verify your new email address");
      expect(email.text).toContain(
        "Enter the code below to confirm this is your new email address for LoopsKey.",
      );
      expect(email.text).toContain(
        "Didn't request this change? Contact support@loopskey.test right away.",
      );
    });
  });

  it.each([
    OtpPurpose.SIGNUP,
    OtpPurpose.RESET_PASSWORD,
    OtpPurpose.CHANGE_EMAIL,
    OtpPurpose.EMAIL_VERIFICATION,
  ])("never prints a placeholder for %s", (purpose) => {
    const email = build(purpose);

    expect(email.html).not.toContain("[Verification code]");
    expect(email.text).not.toContain("[Verification code]");
    expect(email.text).not.toMatch(/\{[A-Za-z]+\}/);
    expect(email.html).not.toMatch(/\{[A-Za-z]+\}/);
  });

  it("keeps the code out of any link", () => {
    const { html } = build(OtpPurpose.SIGNUP);

    expect(html).not.toMatch(/href="[^"]*482913/);
  });

  it("falls back to a neutral message for purposes without catalogue copy", () => {
    const email = build(OtpPurpose.EMAIL_VERIFICATION);

    expect(email.subject).toBe("Your LoopsKey verification code");
    expect(email.text).toContain("482913");
  });
});
