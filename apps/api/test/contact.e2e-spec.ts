import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "@app/app.module";
import { MailService } from "@mail/mail.service";

import cookieParser from "cookie-parser";
import request from "supertest";

const SUBMIT_CONTACT_INQUIRY = `
  mutation SubmitContactInquiry($input: SubmitContactInquiryInput!) {
    submitContactInquiry(input: $input) {
      success
      code
      referenceId
    }
  }
`;

const validInput = {
  fullName: "Ada Lovelace",
  email: "ada@e2e.example.test",
  inquiryType: "TECHNICAL_SUPPORT",
  message: "I cannot export my CPD record for this quarter.",
};

/**
 * Non-production delivery verification for the public contact mutation.
 *
 * The mail provider is replaced with a mock so the suite exercises the whole
 * transport, validation, and recipient-resolution path without sending real
 * email or needing Resend credentials.
 */
describe("Contact inquiry (e2e)", () => {
  let app: INestApplication;
  const sendEmail = jest.fn();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue({ sendEmail, deliver: jest.fn() })
      .compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    sendEmail.mockReset();
    sendEmail.mockResolvedValue(undefined);
  });

  const submit = (input: Record<string, unknown>) =>
    request(app.getHttpServer())
      .post("/graphql")
      .send({ query: SUBMIT_CONTACT_INQUIRY, variables: { input } });

  it("accepts an anonymous submission and requests delivery to the configured recipient", async () => {
    const response = await submit({
      ...validInput,
      email: "accepted@e2e.example.test",
      idempotencyKey: "e2e-accepted",
    });

    const payload = response.body.data.submitContactInquiry;
    expect(payload.success).toBe(true);
    expect(payload.code).toBe("CONTACT_INQUIRY_SUBMITTED");
    expect(payload.referenceId).toEqual(expect.any(String));
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail.mock.calls[0][0].to).toBe("loopskey.dev@gmail.com");
  });

  it("requests no delivery for invalid input", async () => {
    const response = await submit({
      ...validInput,
      email: "not-an-email",
      idempotencyKey: "e2e-invalid",
    });

    expect(response.body.errors).toBeDefined();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects an unknown inquiry type", async () => {
    const response = await submit({
      ...validInput,
      inquiryType: "MARKETING",
      idempotencyKey: "e2e-unknown-type",
    });

    expect(response.body.errors).toBeDefined();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("does not deliver twice for a repeated idempotency key", async () => {
    const input = {
      ...validInput,
      email: "duplicate@e2e.example.test",
      idempotencyKey: "e2e-duplicate",
    };

    const first = await submit(input);
    const second = await submit(input);

    expect(first.body.data.submitContactInquiry.success).toBe(true);
    expect(second.body.data.submitContactInquiry.success).toBe(true);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });

  it("keeps provider credentials out of the response", async () => {
    const response = await submit({
      ...validInput,
      email: "secrets@e2e.example.test",
      idempotencyKey: "e2e-secrets",
    });

    const serialized = JSON.stringify(response.body);
    expect(serialized).not.toContain("RESEND_API_KEY");
    expect(serialized).not.toContain("re_");
    expect(serialized).not.toContain("loopskey.dev@gmail.com");
  });
});
