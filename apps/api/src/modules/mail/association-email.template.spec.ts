import { buildAssociationMemberInvitationEmail } from "./association-email.template";

const invitationUrl =
  "https://app.example.com/auth/association/join?token=abc-DEF_123";

const email = () =>
  buildAssociationMemberInvitationEmail({
    appName: "LoopsKey",
    associationName: "Institute <of> Practice",
    supportEmail: "support@example.com",
    memberName: "Ada Member",
    invitationUrl,
    expiresInMinutes: 60,
  });

describe("buildAssociationMemberInvitationEmail", () => {
  it("puts the link on its own line so no punctuation can join the token", () => {
    const lines = email().text.split("\n");

    expect(lines).toContain(invitationUrl);
  });

  it("links the call to action to the exact invitation url", () => {
    expect(email().html).toContain(`href="${invitationUrl}"`);
  });

  it("escapes association data in the html", () => {
    expect(email().html).toContain("Institute &lt;of&gt; Practice");
    expect(email().html).not.toContain("Institute <of> Practice");
  });
});
