import {
  buildOrganizationApprovalEmail,
  buildOrganizationRejectionEmail,
  buildOrganizationSubmittedEmail,
} from "./organization-email.template";

const base = {
  appName: "LoopsKey",
  organizationName: "Example & Partners",
  supportEmail: "support@example.com",
};

describe("Organization email templates", () => {
  it("builds an application receipt confirmation", () => {
    const email = buildOrganizationSubmittedEmail(base);
    expect(email.text).toContain("waiting for Admin review");
    expect(email.html).toContain("Example &amp; Partners");
  });

  it("includes the applicant-facing rejection reason and no internal notes", () => {
    const email = buildOrganizationRejectionEmail({
      ...base,
      reason: "Required accreditation was not provided.",
    });
    expect(email.text).toContain("Required accreditation");
    expect(email.text).not.toContain("internal");
  });

  it("includes secure activation instructions without a password", () => {
    const email = buildOrganizationApprovalEmail({
      ...base,
      username: "admin@example.com",
      activationUrl: "https://app.example.com/activate?token=secret",
      loginUrl: "https://app.example.com/auth/organization",
      expiresInMinutes: 60,
    });
    expect(email.text).toContain("single-use link expires in 60 minutes");
    expect(email.text).toContain("Do not share this link");
    expect(email.text).not.toMatch(/temporary password/i);
  });
});
