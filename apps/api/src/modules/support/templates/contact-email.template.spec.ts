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
    expect(email.subject).toBe("New contact inquiry — Security concern");
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

  it("keeps a user-supplied name out of the subject and on one line", () => {
    const email = buildContactInquiryEmail({
      ...baseInput,
      fullName: "Ada\r\nBcc: attacker@example.com",
    });

    expect(email.subject).not.toContain("Ada");
    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.text).toContain("Name: Ada Bcc: attacker@example.com");
  });

  it("shows the message in its own block, unchanged in the text", () => {
    const email = buildContactInquiryEmail({
      ...baseInput,
      message: "Line one\nLine <two> & more",
    });

    expect(email.text.endsWith("Message:\nLine one\nLine <two> & more")).toBe(
      true,
    );
    expect(email.html).toContain("Line one\nLine &lt;two&gt; &amp; more");
  });

  it("does not link the sender address", () => {
    const email = buildContactInquiryEmail(baseInput);

    expect(email.html).not.toContain("mailto:");
    expect(email.html).not.toContain("<a ");
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
