import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { AuthMessageCode } from "@auth/enums/message-code.enum";

import { ActivateOrganizationAccountInput } from "./activate-organization-account.input";

const validInput = {
  token: "a-secure-activation-token-value",
  password: "Password123",
  confirmPassword: "Password123",
};

const validateInput = (overrides: Partial<typeof validInput>) =>
  validate(
    plainToInstance(ActivateOrganizationAccountInput, {
      ...validInput,
      ...overrides,
    }),
  );

describe("ActivateOrganizationAccountInput", () => {
  it("accepts a password that meets the project policy", async () => {
    await expect(validateInput({})).resolves.toHaveLength(0);
  });

  it("rejects a password below the minimum length", async () => {
    const errors = await validateInput({
      password: "Pass1",
      confirmPassword: "Pass1",
    });
    expect(errors.map((error) => error.property)).toEqual(["password"]);
  });

  it("rejects a password without both letters and digits", async () => {
    const lettersOnly = await validateInput({ password: "passwordonly" });
    const digitsOnly = await validateInput({ password: "12345678" });
    expect(lettersOnly.map((error) => error.property)).toEqual(["password"]);
    expect(digitsOnly.map((error) => error.property)).toEqual(["password"]);
    expect(Object.values(lettersOnly[0].constraints ?? {})).toContain(
      AuthMessageCode.PASSWORD_STRENGTH_MESSAGE,
    );
  });

  it("rejects a token shorter than an issued one", async () => {
    const errors = await validateInput({ token: "short" });
    expect(errors.map((error) => error.property)).toEqual(["token"]);
  });

  it("requires every field to be present", async () => {
    const errors = await validate(
      plainToInstance(ActivateOrganizationAccountInput, {}),
    );
    expect(errors.map((error) => error.property).sort()).toEqual([
      "confirmPassword",
      "password",
      "token",
    ]);
  });
});
