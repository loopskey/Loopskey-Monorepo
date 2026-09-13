import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { AuthRegisterRole } from "@auth/enums/register-role.enum";
import { RegisterInput } from "./register.input";

const validInput = {
  email: "test@example.com",
  password: "password1",
  confirmPassword: "password1",
  fullName: "Jane Doe",
  role: AuthRegisterRole.PROFESSIONAL,
};

describe("RegisterInput", () => {
  it("accepts a valid full name", async () => {
    const input = plainToInstance(RegisterInput, validInput);
    const errors = await validate(input);
    expect(errors.map((error) => error.property)).not.toContain("fullName");
  });

  it("trims leading and trailing whitespace without collapsing internal spaces", async () => {
    const input = plainToInstance(RegisterInput, {
      ...validInput,
      fullName: "  Jane   Doe  ",
    });
    await validate(input);
    expect(input.fullName).toBe("Jane   Doe");
  });

  it("rejects a whitespace-only full name", async () => {
    const input = plainToInstance(RegisterInput, {
      ...validInput,
      fullName: "     ",
    });
    const errors = await validate(input);
    expect(errors.map((error) => error.property)).toContain("fullName");
  });

  it("rejects a full name shorter than 2 characters once trimmed", async () => {
    const input = plainToInstance(RegisterInput, {
      ...validInput,
      fullName: " J ",
    });
    const errors = await validate(input);
    expect(errors.map((error) => error.property)).toContain("fullName");
  });

  it("accepts a full name at the 120 character bound", async () => {
    const input = plainToInstance(RegisterInput, {
      ...validInput,
      fullName: "a".repeat(120),
    });
    const errors = await validate(input);
    expect(errors.map((error) => error.property)).not.toContain("fullName");
  });

  it("rejects a full name past the 120 character bound", async () => {
    const input = plainToInstance(RegisterInput, {
      ...validInput,
      fullName: "a".repeat(121),
    });
    const errors = await validate(input);
    expect(errors.map((error) => error.property)).toContain("fullName");
  });
});
