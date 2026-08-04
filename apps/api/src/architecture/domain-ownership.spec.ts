import { existsSync, readdirSync, statSync } from "fs";
import { resolve } from "path";

import { Prisma } from "@prisma/client";

import {
  BOUNDARY_EXCEPTIONS,
  BOUNDARY_EXCEPTION_COUNT,
  type BoundaryException,
} from "./boundary-exceptions";
import {
  BOUNDED_CONTEXT_VALUES,
  DOMAIN_DEPENDENCIES,
  MODEL_FREE_CONTEXTS,
  MODEL_OWNERSHIP,
  MODULE_OWNERSHIP,
  SOURCE_PATH_OWNERSHIP,
  type BoundedContext,
} from "./domain-ownership";

/**
 * The ownership manifest is framework-free, so it restates the Prisma model
 * list and the module directory names as plain string literals. That makes it a
 * second source of truth, and these tests are what keep it honest: Prisma and
 * the filesystem win, the manifest follows.
 *
 * They also enforce the rules the exception register only states in prose — no
 * duplicate IDs, no missing removal phase, no entry pointing at a file that no
 * longer exists, and no exception that quietly describes something already
 * allowed.
 */

const REPO_ROOT = resolve(__dirname, "../../../..");

const modelNames = Object.keys(Prisma.ModelName);

describe("domain ownership manifest", () => {
  describe("Prisma model coverage", () => {
    it("assigns an owner to every Prisma model", () => {
      const unassigned = modelNames.filter(
        (model) => !(model in MODEL_OWNERSHIP),
      );

      expect(unassigned).toEqual([]);
    });

    it("does not name a model Prisma no longer has", () => {
      const unknown = Object.keys(MODEL_OWNERSHIP).filter(
        (model) => !modelNames.includes(model),
      );

      expect(unknown).toEqual([]);
    });

    it("covers the schema exactly once per model", () => {
      // Object keys cannot repeat, so this is really a guard on the count: it
      // fails loudly when a migration adds a model and nobody claims it.
      expect(Object.keys(MODEL_OWNERSHIP)).toHaveLength(modelNames.length);
    });

    it("assigns every model to a declared bounded context", () => {
      for (const [model, context] of Object.entries(MODEL_OWNERSHIP)) {
        expect(`${model}:${BOUNDED_CONTEXT_VALUES.includes(context)}`).toBe(
          `${model}:true`,
        );
      }
    });
  });

  describe("module coverage", () => {
    it("maps every module directory to a context", () => {
      // Reading the directory rather than restating it is the point: a new
      // module fails this test on the commit that creates it.
      const modulesDir = resolve(__dirname, "../modules");
      const dirs = readdirSync(modulesDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);

      const unassigned = dirs.filter((dir) => !(dir in MODULE_OWNERSHIP));

      expect(unassigned).toEqual([]);
    });

    it("does not name a module directory that no longer exists", () => {
      const missing = Object.keys(MODULE_OWNERSHIP).filter(
        (dir) => !existsSync(resolve(__dirname, "../modules", dir)),
      );

      expect(missing).toEqual([]);
    });

    it("classifies every source directory that is not a module", () => {
      // Regression guard for the review finding that `src/common` had no
      // context at all: a Phase 2 path-to-context resolver would have returned
      // undefined for every file in it.
      const srcDir = resolve(__dirname, "..");
      const unclassified = readdirSync(srcDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && entry.name !== "modules")
        .map((entry) => `src/${entry.name}`)
        .filter((path) => !(path in SOURCE_PATH_OWNERSHIP));

      expect(unclassified).toEqual([]);
    });

    it("does not name a source directory that no longer exists", () => {
      const missing = Object.keys(SOURCE_PATH_OWNERSHIP).filter(
        (path) => !existsSync(resolve(__dirname, "../..", path)),
      );

      expect(missing).toEqual([]);
    });
  });

  describe("bounded contexts", () => {
    it("gives every model-owning context at least one model", () => {
      const owning = new Set<string>(Object.values(MODEL_OWNERSHIP));
      const expectedEmpty = new Set<string>(MODEL_FREE_CONTEXTS);

      const emptyButNotDeclared = BOUNDED_CONTEXT_VALUES.filter(
        (context) => !owning.has(context) && !expectedEmpty.has(context),
      );

      expect(emptyButNotDeclared).toEqual([]);
    });

    it("keeps the declared model-free contexts genuinely model-free", () => {
      const owning = new Set<string>(Object.values(MODEL_OWNERSHIP));

      for (const context of MODEL_FREE_CONTEXTS) {
        expect(`${context}:${owning.has(context)}`).toBe(`${context}:false`);
      }
    });
  });

  describe("dependency direction", () => {
    it("declares a dependency list for every context", () => {
      expect(Object.keys(DOMAIN_DEPENDENCIES).sort()).toEqual(
        [...BOUNDED_CONTEXT_VALUES].sort(),
      );
    });

    it("never lists a context as its own dependency", () => {
      for (const [context, dependencies] of Object.entries(
        DOMAIN_DEPENDENCIES,
      )) {
        const listed: readonly string[] = dependencies;
        expect(`${context}:${listed.includes(context)}`).toBe(
          `${context}:false`,
        );
      }
    });

    it("is acyclic", () => {
      // An acyclic target graph is the whole point of the exercise. The current
      // code is not acyclic yet (EXC-023 is a real cycle) — this asserts the
      // manifest we are migrating toward, not the code we have.
      const visiting = new Set<string>();
      const settled = new Set<string>();
      const cycles: string[] = [];

      const walk = (context: BoundedContext, trail: string[]) => {
        if (settled.has(context)) return;
        if (visiting.has(context)) {
          cycles.push([...trail, context].join(" -> "));
          return;
        }

        visiting.add(context);
        for (const next of DOMAIN_DEPENDENCIES[context]) {
          walk(next, [...trail, context]);
        }
        visiting.delete(context);
        settled.add(context);
      };

      for (const context of BOUNDED_CONTEXT_VALUES) {
        walk(context, []);
      }

      expect(cycles).toEqual([]);
    });
  });
});

describe("boundary exception register", () => {
  const exceptions: readonly BoundaryException[] = BOUNDARY_EXCEPTIONS;

  it("uses a unique id for every entry", () => {
    const ids = exceptions.map((exception) => exception.id);

    expect(ids).toHaveLength(new Set(ids).size);
  });

  it("names a real source and target context", () => {
    for (const exception of exceptions) {
      expect(`${exception.id}:source:${exception.source}`).toBe(
        `${exception.id}:source:${
          BOUNDED_CONTEXT_VALUES.includes(exception.source)
            ? exception.source
            : "unknown"
        }`,
      );
      expect(`${exception.id}:target:${exception.target}`).toBe(
        `${exception.id}:target:${
          BOUNDED_CONTEXT_VALUES.includes(exception.target)
            ? exception.target
            : "unknown"
        }`,
      );
    }
  });

  it("never records a context violating itself", () => {
    for (const exception of exceptions) {
      expect(`${exception.id}:${exception.source === exception.target}`).toBe(
        `${exception.id}:false`,
      );
    }
  });

  it("points at files that exist", () => {
    const missing = exceptions.flatMap((exception) =>
      exception.files
        .filter((file) => !existsSync(resolve(REPO_ROOT, file)))
        .map((file) => `${exception.id}: ${file}`),
    );

    expect(missing).toEqual([]);
  });

  it("points at files, never at directories", () => {
    // Regression guard: EXC-024 originally listed twelve directories standing
    // in for ~60 files. `existsSync` is true for a directory, so the check
    // above passed vacuously and the register stopped measuring progress.
    const directories = exceptions.flatMap((exception) =>
      exception.files
        .filter((file) => {
          const path = resolve(REPO_ROOT, file);
          return existsSync(path) && statSync(path).isDirectory();
        })
        .map((file) => `${exception.id}: ${file}`),
    );

    expect(directories).toEqual([]);
  });

  it("names a source context that matches the files it lists", () => {
    // Regression guard for the review's High finding. `source` is what Phase 2
    // matches on, so an entry whose files live in a different context fails to
    // permit the violation it was written for — the build would break on the
    // exact import the exception exists to allow.
    const contextOfFile = (file: string): BoundedContext | undefined => {
      const moduleMatch = /^apps\/api\/src\/modules\/([^/]+)\//.exec(file);
      if (moduleMatch) {
        return MODULE_OWNERSHIP[
          moduleMatch[1] as keyof typeof MODULE_OWNERSHIP
        ];
      }

      const sourceMatch = Object.keys(SOURCE_PATH_OWNERSHIP)
        .filter((prefix) => file.startsWith(`apps/api/${prefix}/`))
        .sort((a, b) => b.length - a.length)[0];

      return sourceMatch
        ? SOURCE_PATH_OWNERSHIP[
            sourceMatch as keyof typeof SOURCE_PATH_OWNERSHIP
          ]
        : undefined;
    };

    const mismatches = exceptions.flatMap((exception) =>
      exception.files
        .map((file) => ({ file, context: contextOfFile(file) }))
        .filter(({ context }) => context !== undefined)
        .filter(({ context }) => context !== exception.source)
        .map(
          ({ file, context }) =>
            `${exception.id}: source=${exception.source} but ${file} is ${context}`,
        ),
    );

    expect(mismatches).toEqual([]);
  });

  it("resolves every listed file to a known context", () => {
    // If this fails, the file lives somewhere neither ownership map covers and
    // the check above would have skipped it silently.
    const unresolved = exceptions.flatMap((exception) =>
      exception.files
        .filter(
          (file) =>
            !/^apps\/api\/src\/modules\/[^/]+\//.test(file) &&
            !Object.keys(SOURCE_PATH_OWNERSHIP).some((prefix) =>
              file.startsWith(`apps/api/${prefix}/`),
            ),
        )
        .map((file) => `${exception.id}: ${file}`),
    );

    expect(unresolved).toEqual([]);
  });

  it("names only real Prisma models", () => {
    const unknown = exceptions.flatMap((exception) =>
      exception.models
        .filter((model) => !modelNames.includes(model))
        .map((model) => `${exception.id}: ${model}`),
    );

    expect(unknown).toEqual([]);
  });

  it("never claims a model the source context already owns", () => {
    // An exception for a model you own is not a violation, it is noise — and it
    // would make the count look worse than the architecture is.
    const selfOwned = exceptions.flatMap((exception) =>
      exception.models
        .filter(
          (model) =>
            MODEL_OWNERSHIP[model as keyof typeof MODEL_OWNERSHIP] ===
            exception.source,
        )
        .map((model) => `${exception.id}: ${model}`),
    );

    expect(selfOwned).toEqual([]);
  });

  it("records the model the exception is about, unless it is a pure import", () => {
    const emptyNonImports = exceptions
      .filter(
        (exception) =>
          exception.kind !== "import" && exception.models.length === 0,
      )
      .map((exception) => exception.id);

    expect(emptyNonImports).toEqual([]);
  });

  it("gives every entry a removal phase inside the roadmap", () => {
    for (const exception of exceptions) {
      expect(`${exception.id}:${exception.removalPhase}`).toBe(
        `${exception.id}:${
          exception.removalPhase >= 2 && exception.removalPhase <= 7
            ? exception.removalPhase
            : "out-of-range"
        }`,
      );
    }
  });

  it("has the size the baseline report and the ADRs publish", () => {
    // Deliberately hard-coded. The register's size is quoted in
    // context/modular-monolith-baseline.md and both ADR-001 and ADR-002, and
    // the roadmap requires it to fall monotonically from Phase 3. Changing it
    // should be an explicit edit here, not a silent drift.
    expect(BOUNDARY_EXCEPTION_COUNT).toBe(21);
  });

  it("explains itself in more than a few words", () => {
    // A one-word reason is how an exception register rots into a permanent
    // allowlist. Phase 2 reviewers need to know why each entry was accepted.
    const thin = exceptions
      .filter((exception) => exception.reason.trim().length < 40)
      .map((exception) => exception.id);

    expect(thin).toEqual([]);
  });
});
