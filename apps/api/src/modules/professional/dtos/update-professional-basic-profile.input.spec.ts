import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { UpdateProfessionalBasicProfileInput } from "./update-professional-basic-profile.input";

const validInput = {
  fullName: "Jane Doe",
};

describe("UpdateProfessionalBasicProfileInput", () => {
  it("accepts a valid full name", async () => {
    const input = plainToInstance(
      UpdateProfessionalBasicProfileInput,
      validInput,
    );
    const errors = await validate(input);
    expect(errors.map((error) => error.property)).not.toContain("fullName");
  });

  it("rejects a whitespace-only full name after trimming", async () => {
    const input = plainToInstance(UpdateProfessionalBasicProfileInput, {
      fullName: "   ",
    });
    const errors = await validate(input);
    expect(errors.map((error) => error.property)).toContain("fullName");
  });

  it("rejects a full name past the shared 120 character bound", async () => {
    const input = plainToInstance(UpdateProfessionalBasicProfileInput, {
      fullName: "a".repeat(121),
    });
    const errors = await validate(input);
    expect(errors.map((error) => error.property)).toContain("fullName");
  });
});
