import { AppLanguage, Role } from "@prisma/client";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import {
  ContentTranslationError,
  isTranslationComplete,
  listContentTranslations,
  localizeRecord,
  normalizeSourceLanguage,
  resolveVariants,
  saveContentTranslation,
  setContentTranslationPublication,
} from "@utils/content-translation.util";

import type {
  TranslationParent,
  TranslationRow,
  TranslationStore,
} from "@utils/content-translation.util";

describe("normalizeSourceLanguage", () => {
  it.each([
    ["en", AppLanguage.EN],
    ["EN", AppLanguage.EN],
    ["en-US", AppLanguage.EN],
    ["fr", AppLanguage.FR],
    ["fr_CA", AppLanguage.FR],
    [" fr-FR ", AppLanguage.FR],
  ])("trusts %s", (raw, expected) => {
    expect(normalizeSourceLanguage(raw)).toBe(expected);
  });

  it.each([null, undefined, "", "english", "de", "es-MX", "unknown", "frx"])(
    "does not assert a language for %s",
    (raw) => {
      expect(normalizeSourceLanguage(raw)).toBeNull();
    },
  );
});

describe("resolveVariants", () => {
  it("offers English only for an English source without translations", () => {
    expect(
      resolveVariants({ sourceLanguage: "en", published: [] }),
    ).toMatchObject({ english: true, french: false });
  });

  it("claims neither language for an unknown source", () => {
    expect(
      resolveVariants({ sourceLanguage: null, published: [] }),
    ).toMatchObject({ english: false, french: false });
  });

  it("does not turn an unknown source into English when only French is translated", () => {
    expect(
      resolveVariants({ sourceLanguage: null, published: [AppLanguage.FR] }),
    ).toMatchObject({ english: false, french: true });
  });

  it("does not duplicate a French original at a French URL", () => {
    expect(
      resolveVariants({ sourceLanguage: "fr", published: [] }),
    ).toMatchObject({ english: false, french: false });
  });

  it("serves the French original at /fr once English replaces the default URL", () => {
    expect(
      resolveVariants({ sourceLanguage: "fr", published: [AppLanguage.EN] }),
    ).toMatchObject({ english: true, french: true });
  });
});

describe("localizeRecord", () => {
  const original = {
    id: "c1",
    title: "Original",
    description: "Original body",
    sourceLanguage: "en",
  };
  const french = {
    locale: AppLanguage.FR,
    title: "Titre",
    description: "Corps",
  };

  it("replaces the presentation with the requested published translation", () => {
    const result = localizeRecord(original, [french], AppLanguage.FR);
    expect(result.record).toMatchObject({
      title: "Titre",
      description: "Corps",
    });
    expect(result.contentLanguage).toBe(AppLanguage.FR);
    expect(result.availableLocales).toEqual([AppLanguage.EN, AppLanguage.FR]);
    expect(result.isRequestedAvailable).toBe(true);
  });

  it("keeps the original and reports the variant missing when none is published", () => {
    const result = localizeRecord(original, [], AppLanguage.FR);
    expect(result.record).toBe(original);
    expect(result.isRequestedAvailable).toBe(false);
    expect(result.availableLocales).toEqual([AppLanguage.EN]);
  });

  it("presents the original at the default URL for an unknown source", () => {
    const result = localizeRecord(
      { ...original, sourceLanguage: null },
      [french],
      AppLanguage.EN,
    );
    expect(result.record.title).toBe("Original");
    expect(result.contentLanguage).toBeNull();
    expect(result.availableLocales).toEqual([AppLanguage.FR]);
  });

  it("overlays course lists only when the translation carries them", () => {
    const result = localizeRecord(
      { ...original, learnings: ["a"], requirements: ["b"] },
      [{ ...french, learnings: ["un"], requirements: ["deux"] }],
      AppLanguage.FR,
    );
    expect(result.record).toMatchObject({
      learnings: ["un"],
      requirements: ["deux"],
    });
  });
});

describe("isTranslationComplete", () => {
  it("requires a title and description", () => {
    expect(isTranslationComplete({ title: " ", description: "x" })).toBe(false);
    expect(isTranslationComplete({ title: "x", description: "" })).toBe(false);
    expect(isTranslationComplete({ title: "x", description: "y" })).toBe(true);
  });

  it("requires translated lists whenever the original has them", () => {
    const source = { learnings: ["a"], requirements: [] };
    expect(
      isTranslationComplete({ title: "x", description: "y" }, source),
    ).toBe(false);
    expect(
      isTranslationComplete(
        { title: "x", description: "y", learnings: ["un"] },
        source,
      ),
    ).toBe(true);
  });
});

type Rows = Map<string, TranslationRow & { parentId: string }>;

const makeStore = (parent: TranslationParent | null) => {
  const rows: Rows = new Map();
  let next = 1;
  const touched: string[] = [];
  const store: TranslationStore<null> = {
    transaction: (work) => work(null),
    findParent: async () => parent,
    findTranslation: async (_tx, parentId, locale) =>
      [...rows.values()].find(
        (row) => row.parentId === parentId && row.locale === locale,
      ) ?? null,
    create: async (_tx, parentId, locale, fields) => {
      const row = {
        id: `t${next++}`,
        parentId,
        locale,
        title: fields.title,
        description: fields.description,
        learnings: fields.learnings,
        requirements: fields.requirements,
        isPublished: false,
        publishedAt: null,
        version: 1,
        updatedAt: new Date(),
      };
      rows.set(row.id, row);
      return row;
    },
    update: async (_tx, id, expectedVersion, data) => {
      const row = rows.get(id);
      if (!row || row.version !== expectedVersion) return 0;
      Object.assign(row, data.fields ?? {});
      if (data.isPublished !== undefined) {
        row.isPublished = data.isPublished;
        row.publishedAt = data.publishedAt ?? null;
      }
      row.version += 1;
      return 1;
    },
    reload: async (_tx, id) => rows.get(id)!,
    touchParent: async (_tx, parentId) => {
      touched.push(parentId);
    },
  };
  return { store, rows, touched };
};

const guards = {
  notFound: () => new NotFoundException("PARENT_NOT_FOUND"),
  denied: () => new ForbiddenException("PARENT_ACCESS_DENIED"),
};

const owner = { id: "provider-1", role: Role.PROVIDER };
const parent: TranslationParent = {
  id: "p1",
  providerId: "provider-1",
  deletedAt: null,
  learnings: [],
  requirements: [],
};
const fields = { title: "Titre", description: "Description" };

const save = (
  store: TranslationStore<null>,
  overrides: Partial<Parameters<typeof saveContentTranslation>[2]> = {},
) =>
  saveContentTranslation(store, guards, {
    actor: owner,
    parentId: "p1",
    locale: AppLanguage.FR,
    fields,
    ...overrides,
  });

describe("saveContentTranslation", () => {
  it("creates the first translation as an unpublished draft at version 1", async () => {
    const { store, touched } = makeStore(parent);
    const row = await save(store);
    expect(row).toMatchObject({ version: 1, isPublished: false });
    expect(touched).toEqual([]);
  });

  it("rejects a blank title or description", async () => {
    const { store } = makeStore(parent);
    await expect(
      save(store, { fields: { title: "  ", description: "x" } }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("lets an administrator edit another owner's content", async () => {
    const { store } = makeStore(parent);
    await expect(
      save(store, { actor: { id: "admin-1", role: Role.ADMIN } }),
    ).resolves.toMatchObject({ version: 1 });
  });

  it("denies another provider", async () => {
    const { store } = makeStore(parent);
    await expect(
      save(store, { actor: { id: "provider-2", role: Role.PROVIDER } }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("does not disclose a deleted or missing parent", async () => {
    await expect(save(makeStore(null).store)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      save(makeStore({ ...parent, deletedAt: new Date() }).store),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects an overwrite from a stale version", async () => {
    const { store } = makeStore(parent);
    await save(store);
    await save(store, { expectedVersion: 1 });
    await expect(save(store, { expectedVersion: 1 })).rejects.toMatchObject({
      response: { code: ContentTranslationError.VERSION_CONFLICT },
    });
  });

  it("rejects a create that claims an existing version", async () => {
    const { store } = makeStore(parent);
    await expect(save(store, { expectedVersion: 3 })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("moves the parent's public timestamp only when a published row changes", async () => {
    const { store, touched } = makeStore(parent);
    await save(store);
    await setContentTranslationPublication(store, guards, {
      actor: owner,
      parentId: "p1",
      locale: AppLanguage.FR,
      published: true,
      expectedVersion: 1,
    });
    expect(touched).toEqual(["p1"]);
    await save(store, {
      expectedVersion: 2,
      fields: { title: "Nouveau", description: "Texte" },
    });
    expect(touched).toEqual(["p1", "p1"]);
  });

  it("refuses to publish an incomplete course translation", async () => {
    const { store } = makeStore({ ...parent, learnings: ["Learn"] });
    await save(store);
    await expect(
      setContentTranslationPublication(store, guards, {
        actor: owner,
        parentId: "p1",
        locale: AppLanguage.FR,
        published: true,
        expectedVersion: 1,
      }),
    ).rejects.toMatchObject({
      response: { code: ContentTranslationError.INCOMPLETE },
    });
  });

  it("refuses an edit that would leave a published translation incomplete", async () => {
    const { store } = makeStore({ ...parent, learnings: ["Learn"] });
    await save(store, { fields: { ...fields, learnings: ["Apprendre"] } });
    await setContentTranslationPublication(store, guards, {
      actor: owner,
      parentId: "p1",
      locale: AppLanguage.FR,
      published: true,
      expectedVersion: 1,
    });
    await expect(
      save(store, { expectedVersion: 2, fields: { ...fields, learnings: [] } }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe("setContentTranslationPublication", () => {
  const publish = (
    store: TranslationStore<null>,
    published: boolean,
    expectedVersion: number,
  ) =>
    setContentTranslationPublication(store, guards, {
      actor: owner,
      parentId: "p1",
      locale: AppLanguage.FR,
      published,
      expectedVersion,
    });

  it("needs an existing translation", async () => {
    await expect(
      publish(makeStore(parent).store, true, 1),
    ).rejects.toMatchObject({
      response: { code: ContentTranslationError.NOT_FOUND },
    });
  });

  it("publishes, then unpublishes, bumping the version each time", async () => {
    const { store } = makeStore(parent);
    await save(store);
    const published = await publish(store, true, 1);
    expect(published).toMatchObject({ isPublished: true, version: 2 });
    expect(published.publishedAt).toBeInstanceOf(Date);
    const withdrawn = await publish(store, false, 2);
    expect(withdrawn).toMatchObject({ isPublished: false, version: 3 });
    expect(withdrawn.publishedAt).toBeNull();
  });

  it("is idempotent for an unchanged state", async () => {
    const { store, touched } = makeStore(parent);
    await save(store);
    await publish(store, true, 1);
    const again = await publish(store, true, 2);
    expect(again.version).toBe(2);
    expect(touched).toHaveLength(1);
  });

  it("rejects a stale version", async () => {
    const { store } = makeStore(parent);
    await save(store);
    await expect(publish(store, true, 5)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});

describe("listContentTranslations", () => {
  it("checks ownership before reading", async () => {
    const { store } = makeStore(parent);
    const read = jest.fn().mockResolvedValue([]);
    await expect(
      listContentTranslations(
        store,
        guards,
        { actor: { id: "other", role: Role.PROVIDER }, parentId: "p1" },
        read,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(read).not.toHaveBeenCalled();
  });
});
