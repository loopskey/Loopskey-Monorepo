import { readdirSync, readFileSync } from "fs";
import { basename, resolve } from "path";

const SERVICES_DIR = resolve(__dirname, "services");

const CAPABILITIES = {
  profile: [
    "certification-search.service.ts",
    "professional-credential.service.ts",
    "professional-onboarding.service.ts",
    "professional-profile-completion.service.ts",
    "professional-profile.service.ts",
    "professional-settings.service.ts",
  ],
  pdu: ["professional-pdu-file.service.ts", "professional-pdu.service.ts"],
  "cpd-plan": ["professional-cpd-plan.service.ts"],
  certificate: [
    "professional-certificate-file.service.ts",
    "professional-certificate.service.ts",
  ],
  roadmap: [
    "professional-roadmap.service.ts",
    "professional-roadmap-chat.service.ts",
    "professional-roadmap-draft.service.ts",
  ],
  courses: ["professional-courses.service.ts"],
  payments: ["professional-payments.service.ts"],
  overview: ["professional-overview.service.ts"],
  calendar: ["professional-calendar.service.ts"],
  avatar: ["professional-avatar.service.ts"],
} as const;

const ALLOWED_INTERNAL_EDGES: Readonly<Record<string, readonly string[]>> = {
  "professional-certificate-file.service.ts": [
    "professional-certificate.service.ts",
  ],
  "professional-cpd-plan.service.ts": ["certification-search.service.ts"],
  "professional-onboarding.service.ts": ["professional-profile.service.ts"],
  "professional-pdu-file.service.ts": ["professional-pdu.service.ts"],
  "professional-profile.service.ts": [
    "professional-profile-completion.service.ts",
  ],
  "professional-roadmap-chat.service.ts": [
    "professional-cpd-plan.service.ts",
    "professional-profile.service.ts",
    "professional-roadmap-draft.service.ts",
  ],
};

const serviceFiles = () =>
  readdirSync(SERVICES_DIR).filter((file) => file.endsWith(".service.ts"));

describe("professional capability architecture", () => {
  it("assigns every service to exactly one capability", () => {
    const assigned = Object.values(CAPABILITIES).flat();

    expect([...assigned].sort()).toEqual(serviceFiles().sort());
    expect(new Set(assigned).size).toBe(assigned.length);
  });

  it("allows only documented internal service dependencies and stays acyclic", () => {
    const edges = new Map<string, string[]>();

    for (const file of serviceFiles()) {
      const source = readFileSync(resolve(SERVICES_DIR, file), "utf8");
      const imports = [
        ...source.matchAll(
          /from ["']@professional\/services\/([^"']+\.service)["']/g,
        ),
      ].map((match) => `${basename(match[1])}.ts`);

      expect(imports.sort()).toEqual(
        [...(ALLOWED_INTERNAL_EDGES[file] ?? [])].sort(),
      );
      edges.set(file, imports);
    }

    const visiting = new Set<string>();
    const visited = new Set<string>();
    const walk = (file: string) => {
      expect(visiting.has(file)).toBe(false);
      if (visited.has(file)) return;
      visiting.add(file);
      for (const dependency of edges.get(file) ?? []) walk(dependency);
      visiting.delete(file);
      visited.add(file);
    };

    for (const file of serviceFiles()) walk(file);
  });

  it("keeps filesystem operations behind the evidence storage adapter", () => {
    for (const file of serviceFiles()) {
      const source = readFileSync(resolve(SERVICES_DIR, file), "utf8");
      expect(source).not.toMatch(/from ["']fs(?:\/promises)?["']/);
      expect(source).not.toMatch(/\b(?:mkdir|writeFile|unlink|rm)Sync?\s*\(/);
    }
  });

  it("keeps overview free of Prisma writes", () => {
    const overview = readFileSync(
      resolve(SERVICES_DIR, "professional-overview.service.ts"),
      "utf8",
    );
    expect(overview).not.toMatch(
      /prisma(?:Service)?\.[\w]+\.(?:create|update|upsert|delete|createMany|updateMany|deleteMany)\s*\(/,
    );
  });
});
