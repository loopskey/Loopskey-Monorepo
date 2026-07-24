import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { CreateCertificateInput } from "./create-certificate.input";
import { UpdateCertificateInput } from "./update-certificate.input";

const validInput = {
  title: "AWS Solutions Architect",
  issuer: "Amazon Web Services",
  issueDate: "2026-01-15",
  validUntil: "2029-01-15",
};

describe("CreateCertificateInput", () => {
  it("accepts the required fields with the optional ones omitted", async () => {
    const input = plainToInstance(CreateCertificateInput, validInput);
    await expect(validate(input)).resolves.toHaveLength(0);
  });

  it("rejects missing required fields", async () => {
    const input = plainToInstance(CreateCertificateInput, {});
    const invalid = (await validate(input)).map((error) => error.property);
    expect(invalid).toEqual(
      expect.arrayContaining(["title", "issuer", "issueDate", "validUntil"]),
    );
  });

  it("rejects a blank title or issuer once trimmed", async () => {
    const input = plainToInstance(CreateCertificateInput, {
      ...validInput,
      title: "   ",
      issuer: "   ",
    });
    await validate(input);
    expect(input.title).toBe("");
    expect(input.issuer).toBe("");
  });

  it("rejects non-date issue and expiry values", async () => {
    const input = plainToInstance(CreateCertificateInput, {
      ...validInput,
      issueDate: "not-a-date",
      validUntil: "also-not-a-date",
    });
    const invalid = (await validate(input)).map((error) => error.property);
    expect(invalid).toEqual(
      expect.arrayContaining(["issueDate", "validUntil"]),
    );
  });

  it("trims the optional certificate number and nulls an empty one", async () => {
    const filled = plainToInstance(CreateCertificateInput, {
      ...validInput,
      certificateNumber: "  ABC-123  ",
    });
    await expect(validate(filled)).resolves.toHaveLength(0);
    expect(filled.certificateNumber).toBe("ABC-123");

    const blank = plainToInstance(CreateCertificateInput, {
      ...validInput,
      certificateNumber: "   ",
    });
    await expect(validate(blank)).resolves.toHaveLength(0);
    expect(blank.certificateNumber).toBeNull();
  });

  it("bounds the length of free-text fields", async () => {
    const input = plainToInstance(CreateCertificateInput, {
      ...validInput,
      title: "a".repeat(201),
      certificateNumber: "b".repeat(121),
    });
    const invalid = (await validate(input)).map((error) => error.property);
    expect(invalid).toEqual(
      expect.arrayContaining(["title", "certificateNumber"]),
    );
  });
});

describe("UpdateCertificateInput", () => {
  it("requires an id alongside the certificate fields", async () => {
    const input = plainToInstance(UpdateCertificateInput, validInput);
    const invalid = (await validate(input)).map((error) => error.property);
    expect(invalid).toContain("id");
  });

  it("does not accept cpdPlanId, which is set by its own mutation", async () => {
    const input = plainToInstance(UpdateCertificateInput, {
      ...validInput,
      id: "cert-1",
      cpdPlanId: "plan-1",
    });

    // Mirrors the app's global ValidationPipe, which rejects properties the
    // DTO does not declare.
    const errors = await validate(input, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    expect(errors.map((error) => error.property)).toContain("cpdPlanId");
  });
});
