import {
  assertHttpUrl,
  escapeHtml,
  paragraph,
  renderEmail,
  singleLine,
} from "@mail/utils/email-layout";

const render = (overrides: Partial<Parameters<typeof renderEmail>[0]> = {}) =>
  renderEmail({
    brand: "LoopsKey",
    subject: "Subject",
    heading: "Heading",
    blocks: [paragraph("Hello")],
    ...overrides,
  });

describe("the shared email layout", () => {
  describe("singleLine", () => {
    it("collapses line breaks and control characters to one line", () => {
      expect(singleLine("Ada\r\nBcc: x@y.test\u0000\tLovelace")).toBe(
        "Ada Bcc: x@y.test Lovelace",
      );
    });

    it("leaves ordinary punctuation and accents alone", () => {
      expect(singleLine("L'Équipe — « Q&A » #1")).toBe("L'Équipe — « Q&A » #1");
    });
  });

  describe("assertHttpUrl", () => {
    it("accepts http and https links unchanged", () => {
      expect(assertHttpUrl("https://app.test/a?token=x_y-1")).toBe(
        "https://app.test/a?token=x_y-1",
      );
      expect(assertHttpUrl("http://localhost:3000")).toBe(
        "http://localhost:3000",
      );
    });

    it.each([
      "javascript:alert(1)",
      "data:text/html,<b>x</b>",
      "/dashboard/professional",
      'https://app.test/"onclick="x',
      "https://app.test/a b",
      "https://app.test/\u0007",
    ])("rejects %s", (url) => {
      expect(() => assertHttpUrl(url)).toThrow();
    });
  });

  describe("renderEmail", () => {
    it("sanitises the subject", () => {
      const email = render({ subject: "Hello\r\nBcc: attacker@x.test" });

      expect(email.subject).toBe("Hello Bcc: attacker@x.test");
      expect(email.subject).not.toMatch(/[\r\n]/);
    });

    it("escapes every text segment in the html", () => {
      const email = render({
        heading: "<b>Heading</b>",
        blocks: [
          paragraph("<script>alert(1)</script>"),
          { kind: "field", label: "Name", value: '"><img src=x>' },
        ],
      });

      expect(email.html).not.toContain("<script>");
      expect(email.html).not.toContain("<img src=x>");
      expect(email.html).toContain("&lt;script&gt;");
      expect(email.html).toContain("&lt;b&gt;Heading&lt;/b&gt;");
    });

    it("keeps ordinary punctuation readable in the plain text", () => {
      const email = render({
        blocks: [paragraph('Tom & Jerry\'s "plan" <draft>')],
      });

      expect(email.text).toContain('Tom & Jerry\'s "plan" <draft>');
    });

    it("gives a button both a link and a full url in the text", () => {
      const url = "https://app.test/activate?token=a-b_c";
      const email = render({
        blocks: [{ kind: "cta", label: "Set your password", url }],
      });

      expect(email.html).toContain(`href="${url}"`);
      expect(email.html).toContain(">Set your password</a>");
      expect(email.text).toContain(`Set your password: ${url}`);
    });

    it("refuses an unsafe button url instead of rendering it", () => {
      expect(() =>
        render({
          blocks: [{ kind: "cta", label: "Open", url: "javascript:alert(1)" }],
        }),
      ).toThrow();
    });

    it("links a support address only when it is a plain address", () => {
      const linked = render({
        blocks: [paragraph("Contact ", { mailto: "help@loopskey.test" })],
      });
      const notLinked = render({
        blocks: [paragraph("Contact ", { mailto: 'x" onclick="y' })],
      });

      expect(linked.html).toContain('href="mailto:help@loopskey.test"');
      expect(notLinked.html).not.toContain("mailto:");
      expect(notLinked.html).not.toContain('onclick="y');
    });

    it("renders a code block and the same value in the text", () => {
      const email = render({ blocks: [{ kind: "code", value: "123456" }] });

      expect(email.html).toContain(">123456<");
      expect(email.text.split("\n")).toContain("123456");
    });

    it("sets the document language", () => {
      expect(render({ language: "fr" }).html).toContain('<html lang="fr">');
      expect(render().html).toContain('<html lang="en">');
    });

    it("escapes html the way the old templates did", () => {
      expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
        "&lt;a href=&quot;x&quot;&gt;&#039;&amp;&#039;&lt;/a&gt;",
      );
    });
  });
});
