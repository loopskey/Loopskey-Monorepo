import { buildSchema, parse, validate } from "graphql";
import { operationLimitsRule } from "@utils/graphql-operation-limits.util";

const schema = buildSchema(`
  type Node { id: ID! child: Node name: String }
  type Query { node: Node }
`);

const run = (
  query: string,
  limits = { maxDepth: 4, maxAliases: 3, maxFields: 12 },
) => validate(schema, parse(query), [operationLimitsRule(limits)]);

describe("operationLimitsRule", () => {
  it("accepts an ordinary operation", () => {
    expect(run("{ node { id child { id name } } }")).toEqual([]);
  });

  it("rejects an operation that is too deep", () => {
    const errors = run(
      "{ node { child { child { child { child { id } } } } } }",
    );
    expect(errors[0]?.extensions?.code).toBe("OPERATION_TOO_COMPLEX");
    expect(errors[0]?.message).toMatch(/maximum depth/);
  });

  it("rejects too many aliases", () => {
    const errors = run(
      "{ a: node { id } b: node { id } c: node { id } d: node { id } }",
    );
    expect(errors[0]?.message).toMatch(/aliases/);
  });

  it("rejects too many fields", () => {
    const fields = Array.from({ length: 13 }, () => "id").join(" ");
    const errors = run(`{ node { ${fields} } }`);
    expect(errors[0]?.message).toMatch(/fields/);
  });

  it("counts depth reached through fragments", () => {
    const errors = run(
      "query { node { ...Deep } } fragment Deep on Node { child { child { child { child { id } } } } }",
    );
    expect(errors[0]?.message).toMatch(/maximum depth/);
  });

  it("terminates on fragment cycles without crashing", () => {
    const errors = run(
      "query { node { ...A } } fragment A on Node { child { ...A } }",
    );
    expect(errors.map((error) => error.message).join()).not.toMatch(
      /Maximum call stack/,
    );
  });

  it("does not count introspection fields", () => {
    expect(run("{ __schema { types { name } } }")).toEqual([]);
  });
});
