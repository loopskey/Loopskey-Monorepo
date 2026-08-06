import { SubmitContactInquiryInput } from "@support/dtos/submit-contact-inquiry.input";
import { ContactInquiryType } from "@support/enums/contact-inquiry.enum";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

// Mirrors the app's global ValidationPipe, which transforms and whitelists.
const validate = (payload: Record<string, unknown>) => {
  const instance = plainToInstance(SubmitContactInquiryInput, payload);
  return { instance, errors: validateSync(instance, { whitelist: true }) };
};

const validPayload = {
  fullName: "Ada Lovelace",
  email: "ada@example.com",
  inquiryType: ContactInquiryType.GENERAL_QUESTION,
  message: "I would like to know more about association partnerships.",
};

describe("SubmitContactInquiryInput", () => {
  it("accepts a valid inquiry", () => {
    const { errors } = validate(validPayload);
    expect(errors).toHaveLength(0);
  });

  it("trims surrounding whitespace from text fields", () => {
    const { instance } = validate({
      ...validPayload,
      fullName: "  Ada Lovelace  ",
      message: `  ${validPayload.message}  `,
    });

    expect(instance.fullName).toBe("Ada Lovelace");
    expect(instance.message).toBe(validPayload.message);
  });

  it("normalizes the email to lower case", () => {
    const { instance, errors } = validate({
      ...validPayload,
      email: "  Ada@Example.COM ",
    });

    expect(errors).toHaveLength(0);
    expect(instance.email).toBe("ada@example.com");
  });

  it("treats a blank organization as absent", () => {
    const { instance, errors } = validate({
      ...validPayload,
      organization: "   ",
    });

    expect(errors).toHaveLength(0);
    expect(instance.organization).toBeUndefined();
  });

  it("keeps a provided organization", () => {
    const { instance, errors } = validate({
      ...validPayload,
      organization: "  INCOSE  ",
    });

    expect(errors).toHaveLength(0);
    expect(instance.organization).toBe("INCOSE");
  });

  it.each([
    ["missing full name", { ...validPayload, fullName: "" }],
    ["whitespace-only message", { ...validPayload, message: "        " }],
    ["invalid email", { ...validPayload, email: "not-an-email" }],
    ["unknown inquiry type", { ...validPayload, inquiryType: "MARKETING" }],
    ["over-long message", { ...validPayload, message: "x".repeat(5001) }],
    ["over-long name", { ...validPayload, fullName: "x".repeat(121) }],
  ])("rejects %s", (_label, payload) => {
    const { errors } = validate(payload);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("supports every approved inquiry type", () => {
    for (const inquiryType of Object.values(ContactInquiryType)) {
      const { errors } = validate({ ...validPayload, inquiryType });
      expect(errors).toHaveLength(0);
    }
    expect(Object.values(ContactInquiryType)).toHaveLength(11);
  });
});
