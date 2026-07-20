import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { OrganizationType } from "@prisma/client";

import { SubmitOrganizationAccessRequestInput } from "./submit-org-access-request.input";

const validInput = {
  representativeFullName: "Alex Morgan",
  organizationName: "Example Association",
  workEmail: "alex@example.org",
  organizationType: OrganizationType.ASSOCIATION,
  representativeJobRole: "Program Director",
  expectedLicensedProfessionals: 12,
  country: "Canada",
  goals: "Support continuing professional development.",
};

describe("SubmitOrganizationAccessRequestInput", () => {
  it("rejects missing required fields and an invalid email", async () => {
    const input = plainToInstance(SubmitOrganizationAccessRequestInput, {
      ...validInput,
      representativeFullName: " ",
      workEmail: "not-an-email",
    });

    const errors = await validate(input);
    const invalidProperties = errors.map((error) => error.property);

    expect(invalidProperties).toEqual(
      expect.arrayContaining(["representativeFullName", "workEmail"]),
    );
  });

  it("normalizes surrounding whitespace and email casing", async () => {
    const input = plainToInstance(SubmitOrganizationAccessRequestInput, {
      ...validInput,
      organizationName: "  Example Association  ",
      workEmail: "  ALEX@EXAMPLE.ORG  ",
    });

    await expect(validate(input)).resolves.toHaveLength(0);
    expect(input.organizationName).toBe("Example Association");
    expect(input.workEmail).toBe("alex@example.org");
  });
});
