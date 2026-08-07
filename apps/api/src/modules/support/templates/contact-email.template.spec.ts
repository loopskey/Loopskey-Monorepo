import { buildContactInquiryEmail } from "@support/templates/contact-email.template";
import { ContactInquiryType } from "@support/enums/contact-inquiry.enum";

const baseInput = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  inquiryType: ContactInquiryType.SECURITY_CONCERN,
  message: "Reporting a possible issue.",
  referenceId: "ref-123",
};

describe("buildContactInquiryEmail", () => {
  it("labels the inquiry type in the subject", () => {
    const email = buildContactInquiryEmail(baseInput);
    expect(email.subject).toBe("[Contact] Security concern - Ada Lovelace");
  });

  it("escapes user-supplied content in the HTML body", () => {
    const email = buildContactInquiryEmail({
      ...baseInput,
      fullName: '<img src=x onerror="alert(1)">',
      message: "<script>alert('xss')</script>",
    });

    expect(email.html).not.toContain("<script>");
    expect(email.html).not.toContain("<img src=x");
    expect(email.html).toContain("&lt;script&gt;");
  });

  it("marks a missing organization explicitly", () => {
    const email = buildContactInquiryEmail(baseInput);
    expect(email.text).toContain("Organization: Not provided");
  });

  it("includes the reference id for operator correlation", () => {
    const email = buildContactInquiryEmail(baseInput);
    expect(email.text).toContain("ref-123");
    expect(email.html).toContain("ref-123");
  });
});
