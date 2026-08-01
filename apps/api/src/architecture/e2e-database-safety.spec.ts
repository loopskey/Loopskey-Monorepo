import { assertIsolatedTestDatabase } from "../../test/setup/database-safety";

describe("E2E database safety", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = "test";
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it.each(["loopskey", "loopskey_dev", "loopskey_production", "postgres"])(
    "rejects the non-test database %s",
    (database) => {
      expect(() =>
        assertIsolatedTestDatabase(
          `postgresql://user:pass@localhost/${database}`,
        ),
      ).toThrow("Refusing E2E database");
    },
  );

  it("accepts an explicitly named isolated test database", () => {
    expect(
      assertIsolatedTestDatabase(
        "postgresql://user:pass@localhost/loopskey_test_phase2",
      ),
    ).toContain("loopskey_test_phase2");
  });
});
