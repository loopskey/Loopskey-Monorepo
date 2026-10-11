import { AppLanguage, AuditAction, Prisma, Role } from "@prisma/client";
import { ConflictException, ForbiddenException } from "@nestjs/common";
import { contentSocialImagePath } from "@loopskey/api-contracts/upload";
import { ContentSeoMessageCode } from "@loopskey/api-contracts/error-codes";
import { BadRequestException } from "@nestjs/common";
import { CONTENT_SEO_LIMITS } from "@loopskey/api-contracts/validation";

export const SEO_TITLE_MAX_LENGTH = CONTENT_SEO_LIMITS.titleMax;
export const SEO_DESCRIPTION_MAX_LENGTH = CONTENT_SEO_LIMITS.descriptionMax;
export const SEO_IMAGE_ALT_MAX_LENGTH = CONTENT_SEO_LIMITS.imageAltMax;
export const SEO_IMAGE_ID_MAX_LENGTH = 64;

const LAST_C0_CONTROL = 0x1f;
const FIRST_C1_CONTROL = 0x7f;
const LAST_C1_CONTROL = 0x9f;
const WHITESPACE = /\s+/g;

export type SeoFieldName =
  | "seoTitle"
  | "seoDescription"
  | "socialImageId"
  | "socialImageAlt";

export type SeoFields = Record<SeoFieldName, string | null>;

export type SeoPatch = { [Name in SeoFieldName]?: string | null };

export type SeoRow = SeoFields & {
  id: string;
  version: number;
  updatedAt: Date;
  locale: AppLanguage;
};

export type SeoParent = {
  id: string;
  deletedAt: Date | null;
  providerId: string | null;
  excludeFromIndex: boolean;
};

export type SeoImage = { id: string; ownerId: string };

export type SeoActor = { id: string; role: Role };

export type SeoGuards = {
  notFound: () => Error;
  denied: () => Error;
};

export interface SeoStore<TTx extends Prisma.TransactionClient> {
  transaction<TResult>(work: (tx: TTx) => Promise<TResult>): Promise<TResult>;
  findParent(tx: TTx, parentId: string): Promise<SeoParent | null>;
  findRow(
    tx: TTx,
    parentId: string,
    locale: AppLanguage,
  ): Promise<SeoRow | null>;
  findImage(tx: TTx, imageId: string): Promise<SeoImage | null>;
  create(
    tx: TTx,
    parentId: string,
    locale: AppLanguage,
    fields: SeoFields,
    actorId: string,
  ): Promise<SeoRow>;
  update(
    tx: TTx,
    rowId: string,
    expectedVersion: number,
    fields: SeoFields,
    actorId: string,
  ): Promise<number>;
  reload(tx: TTx, rowId: string): Promise<SeoRow>;
  setExclusion(tx: TTx, parentId: string, excluded: boolean): Promise<number>;
  touchParent(tx: TTx, parentId: string): Promise<void>;
}

export const seoConflict = () =>
  new ConflictException({
    code: ContentSeoMessageCode.VERSION_CONFLICT,
    message: ContentSeoMessageCode.VERSION_CONFLICT,
  });

export const seoInvalid = (field: SeoFieldName) =>
  new BadRequestException({
    code: ContentSeoMessageCode.INVALID_FIELD,
    message: ContentSeoMessageCode.INVALID_FIELD,
    field,
  });

export const seoImageMissing = () =>
  new BadRequestException({
    code: ContentSeoMessageCode.IMAGE_NOT_FOUND,
    message: ContentSeoMessageCode.IMAGE_NOT_FOUND,
  });

export const seoIndexForbidden = () =>
  new ForbiddenException({
    code: ContentSeoMessageCode.INDEX_FORBIDDEN,
    message: ContentSeoMessageCode.INDEX_FORBIDDEN,
  });

const FIELD_LIMITS: Record<Exclude<SeoFieldName, "socialImageId">, number> = {
  seoTitle: SEO_TITLE_MAX_LENGTH,
  seoDescription: SEO_DESCRIPTION_MAX_LENGTH,
  socialImageAlt: SEO_IMAGE_ALT_MAX_LENGTH,
};

const isControlCode = (code: number) =>
  code <= LAST_C0_CONTROL ||
  (code >= FIRST_C1_CONTROL && code <= LAST_C1_CONTROL);

const withoutControlCharacters = (value: string) =>
  Array.from(value, (character) =>
    isControlCode(character.charCodeAt(0)) ? " " : character,
  ).join("");

export const cleanSeoText = (value: string) =>
  withoutControlCharacters(value).replace(WHITESPACE, " ").trim();

const normalizeField = (
  name: SeoFieldName,
  value: string | null | undefined,
): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (name === "socialImageId") {
    const trimmed = value.trim();
    if (trimmed.length > SEO_IMAGE_ID_MAX_LENGTH) throw seoInvalid(name);
    return trimmed || null;
  }
  const cleaned = cleanSeoText(value);
  if (cleaned.length > FIELD_LIMITS[name]) throw seoInvalid(name);
  return cleaned || null;
};

const EMPTY_FIELDS: SeoFields = {
  seoTitle: null,
  seoDescription: null,
  socialImageId: null,
  socialImageAlt: null,
};

export const emptySeoFields = (): SeoFields => ({ ...EMPTY_FIELDS });

const FIELD_NAMES = Object.keys(EMPTY_FIELDS) as SeoFieldName[];

export const applySeoPatch = (
  current: SeoFields | null,
  patch: SeoPatch,
): SeoFields => {
  const base = current ?? EMPTY_FIELDS;
  const next = { ...base };
  for (const name of FIELD_NAMES) {
    const value = normalizeField(name, patch[name]);
    if (value !== undefined) next[name] = value;
  }
  const imageChanged = next.socialImageId !== base.socialImageId;
  if (imageChanged && patch.socialImageAlt === undefined)
    next.socialImageAlt = null;
  if (!next.socialImageId) next.socialImageAlt = null;
  return next;
};

export const changedSeoFields = (
  before: SeoFields | null,
  after: SeoFields,
): SeoFieldName[] =>
  FIELD_NAMES.filter((name) => (before?.[name] ?? null) !== after[name]);

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

const isImageForeignKeyViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2003" &&
  JSON.stringify(error.meta ?? {}).includes("socialImage");

const authorize = async <TTx extends Prisma.TransactionClient>(
  store: SeoStore<TTx>,
  tx: TTx,
  parentId: string,
  actor: SeoActor,
  guards: SeoGuards,
) => {
  const parent = await store.findParent(tx, parentId);
  if (!parent || parent.deletedAt) throw guards.notFound();
  if (actor.role !== Role.ADMIN && parent.providerId !== actor.id)
    throw guards.denied();
  return parent;
};

const assertImageUsable = async <TTx extends Prisma.TransactionClient>(
  store: SeoStore<TTx>,
  tx: TTx,
  imageId: string,
  actor: SeoActor,
  parent: SeoParent,
) => {
  const image = await store.findImage(tx, imageId);
  if (!image) throw seoImageMissing();
  const isOwn = image.ownerId === actor.id;
  const isParentProviders =
    actor.role === Role.ADMIN && image.ownerId === parent.providerId;
  if (!isOwn && !isParentProviders) throw seoImageMissing();
};

export type SaveSeoOutcome = {
  row: SeoRow;
  changed: SeoFieldName[];
  replacedImageId: string | null;
};

export const saveContentSeo = async <TTx extends Prisma.TransactionClient>(
  store: SeoStore<TTx>,
  guards: SeoGuards,
  entityType: string,
  request: {
    actor: SeoActor;
    parentId: string;
    locale: AppLanguage;
    patch: SeoPatch;
    expectedVersion?: number | null;
  },
): Promise<SaveSeoOutcome> => {
  const normalizedPatch: SeoPatch = {};
  for (const name of FIELD_NAMES) {
    const value = normalizeField(name, request.patch[name]);
    if (value !== undefined) normalizedPatch[name] = value;
  }

  try {
    return await store.transaction(async (tx) => {
      const parent = await authorize(
        store,
        tx,
        request.parentId,
        request.actor,
        guards,
      );
      const existing = await store.findRow(
        tx,
        request.parentId,
        request.locale,
      );
      const fields = applySeoPatch(existing, normalizedPatch);

      if (
        fields.socialImageId &&
        fields.socialImageId !== existing?.socialImageId
      )
        await assertImageUsable(
          store,
          tx,
          fields.socialImageId,
          request.actor,
          parent,
        );

      const changed = changedSeoFields(existing, fields);
      const replacedImageId =
        existing?.socialImageId &&
        existing.socialImageId !== fields.socialImageId
          ? existing.socialImageId
          : null;

      if (!existing) {
        if (request.expectedVersion) throw seoConflict();
        let created: SeoRow;
        try {
          created = await store.create(
            tx,
            request.parentId,
            request.locale,
            fields,
            request.actor.id,
          );
        } catch (error) {
          throw isUniqueViolation(error) ? seoConflict() : error;
        }
        await recordSeoChange(store, tx, entityType, request, changed);
        return { row: created, changed, replacedImageId: null };
      }

      if (request.expectedVersion !== existing.version) throw seoConflict();
      if (changed.length === 0)
        return { row: existing, changed, replacedImageId: null };

      const updated = await store.update(
        tx,
        existing.id,
        existing.version,
        fields,
        request.actor.id,
      );
      if (updated !== 1) throw seoConflict();
      await recordSeoChange(store, tx, entityType, request, changed);
      return {
        row: await store.reload(tx, existing.id),
        changed,
        replacedImageId,
      };
    });
  } catch (error) {
    throw isImageForeignKeyViolation(error) ? seoImageMissing() : error;
  }
};

const recordSeoChange = async <TTx extends Prisma.TransactionClient>(
  store: SeoStore<TTx>,
  tx: TTx,
  entityType: string,
  request: {
    actor: SeoActor;
    parentId: string;
    locale: AppLanguage;
  },
  changed: readonly SeoFieldName[],
) => {
  await store.touchParent(tx, request.parentId);
  await tx.auditLog.create({
    data: {
      actorId: request.actor.id,
      action: AuditAction.CONTENT_SEO_UPDATED,
      entityType,
      entityId: request.parentId,
      metadata: {
        locale: request.locale,
        fields: [...changed],
      },
    },
  });
};

export const setContentIndexExclusion = async <
  TTx extends Prisma.TransactionClient,
>(
  store: SeoStore<TTx>,
  guards: SeoGuards,
  entityType: string,
  request: { actor: SeoActor; parentId: string; excluded: boolean },
): Promise<{ excludeFromIndex: boolean; changed: boolean }> => {
  if (request.actor.role !== Role.ADMIN) throw seoIndexForbidden();

  return store.transaction(async (tx) => {
    await authorize(store, tx, request.parentId, request.actor, guards);
    const count = await store.setExclusion(
      tx,
      request.parentId,
      request.excluded,
    );
    if (count === 1) {
      await store.touchParent(tx, request.parentId);
      await tx.auditLog.create({
        data: {
          actorId: request.actor.id,
          action: AuditAction.CONTENT_INDEX_EXCLUSION_CHANGED,
          entityType,
          entityId: request.parentId,
          metadata: { excludeFromIndex: request.excluded },
        },
      });
    }
    return { excludeFromIndex: request.excluded, changed: count === 1 };
  });
};

export const readContentSeo = async <
  TTx extends Prisma.TransactionClient,
  TRead,
>(
  store: SeoStore<TTx>,
  guards: SeoGuards,
  request: { actor: SeoActor; parentId: string },
  read: (tx: TTx, parentId: string) => Promise<TRead>,
) =>
  store.transaction(async (tx) => {
    const parent = await authorize(
      store,
      tx,
      request.parentId,
      request.actor,
      guards,
    );
    return { parent, read: await read(tx, request.parentId) };
  });

export type EffectiveSeo = {
  seoTitle: string | null;
  seoDescription: string | null;
  socialImageAlt: string | null;
  socialImagePath: string | null;
};

export const effectiveSeo = (
  row:
    | Pick<
        SeoRow,
        "seoTitle" | "seoDescription" | "socialImageAlt" | "socialImageId"
      >
    | null
    | undefined,
): EffectiveSeo => ({
  seoTitle: row?.seoTitle ?? null,
  seoDescription: row?.seoDescription ?? null,
  socialImageAlt: row?.socialImageAlt ?? null,
  socialImagePath: row?.socialImageId
    ? contentSocialImagePath(row.socialImageId)
    : null,
});

export const SEO_LOCALES: readonly AppLanguage[] = [
  AppLanguage.EN,
  AppLanguage.FR,
];
