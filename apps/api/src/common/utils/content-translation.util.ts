import { AppLanguage, Prisma, Role } from "@prisma/client";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

export enum ContentTranslationError {
  VERSION_CONFLICT = "CONTENT_TRANSLATION_VERSION_CONFLICT",
  INCOMPLETE = "CONTENT_TRANSLATION_INCOMPLETE",
  NOT_FOUND = "CONTENT_TRANSLATION_NOT_FOUND",
}

export const TRANSLATION_TITLE_MAX_LENGTH = 180;
export const TRANSLATION_DESCRIPTION_MAX_LENGTH = 5000;
export const TRANSLATION_LIST_MAX_SIZE = 30;
export const TRANSLATION_LIST_ITEM_MAX_LENGTH = 300;

const SOURCE_LANGUAGE_PATTERN = /^(en|fr)(?:[-_][A-Za-z]{2,4})?$/i;

export type TranslationFields = {
  title: string;
  description: string;
  learnings?: string[];
  requirements?: string[];
};

export type TranslationSource = {
  learnings?: readonly string[];
  requirements?: readonly string[];
};

export type TranslationRow = TranslationFields & {
  id: string;
  version: number;
  updatedAt: Date;
  locale: AppLanguage;
  isPublished: boolean;
  publishedAt: Date | null;
};

export type TranslationParent = TranslationSource & {
  id: string;
  deletedAt: Date | null;
  providerId: string | null;
};

export type TranslationActor = { id: string; role: Role };

export type PublishedTranslation = Partial<TranslationFields> & {
  locale: AppLanguage;
};

export type LocalizedPresentation<TRecord> = {
  record: TRecord;
  contentLanguage: AppLanguage | null;
  availableLocales: AppLanguage[];
  isRequestedAvailable: boolean;
};

export const normalizeSourceLanguage = (
  raw: string | null | undefined,
): AppLanguage | null => {
  const match = SOURCE_LANGUAGE_PATTERN.exec(raw?.trim() ?? "");
  if (!match) return null;
  return match[1].toLowerCase() === "fr" ? AppLanguage.FR : AppLanguage.EN;
};

const cleaned = (values: readonly string[] | undefined) =>
  (values ?? []).map((value) => value.trim()).filter(Boolean);

export const cleanTranslationFields = (
  fields: TranslationFields,
): TranslationFields => ({
  title: fields.title.trim(),
  description: fields.description.trim(),
  ...(fields.learnings ? { learnings: cleaned(fields.learnings) } : {}),
  ...(fields.requirements
    ? { requirements: cleaned(fields.requirements) }
    : {}),
});

export const isTranslationComplete = (
  fields: TranslationFields,
  source: TranslationSource = {},
) => {
  if (!fields.title.trim() || !fields.description.trim()) return false;
  if (cleaned(source.learnings).length > 0 && !cleaned(fields.learnings).length)
    return false;
  if (
    cleaned(source.requirements).length > 0 &&
    !cleaned(fields.requirements).length
  )
    return false;
  return true;
};

type VariantInput = {
  sourceLanguage: string | null | undefined;
  published: readonly AppLanguage[];
};

export const resolveVariants = ({
  sourceLanguage,
  published,
}: VariantInput) => {
  const source = normalizeSourceLanguage(sourceLanguage);
  const hasEnglishTranslation = published.includes(AppLanguage.EN);
  const hasFrenchTranslation = published.includes(AppLanguage.FR);
  return {
    source,
    english: hasEnglishTranslation || source === AppLanguage.EN,
    french:
      hasFrenchTranslation ||
      (source === AppLanguage.FR && hasEnglishTranslation),
  };
};

const overlay = <TRecord extends { title: string }>(
  record: TRecord,
  translation: PublishedTranslation,
): TRecord => {
  const next: Record<string, unknown> = { ...record };
  if (translation.title !== undefined) next.title = translation.title;
  if (translation.description !== undefined)
    next.description = translation.description;
  if (translation.learnings !== undefined)
    next.learnings = translation.learnings;
  if (translation.requirements !== undefined)
    next.requirements = translation.requirements;
  return next as TRecord;
};

export const localizeRecord = <
  TRecord extends { title: string; sourceLanguage?: string | null },
>(
  record: TRecord,
  published: readonly PublishedTranslation[],
  requested: AppLanguage | null | undefined,
): LocalizedPresentation<TRecord> => {
  const variants = resolveVariants({
    sourceLanguage: record.sourceLanguage,
    published: published.map((translation) => translation.locale),
  });
  const availableLocales = [
    ...(variants.english ? [AppLanguage.EN] : []),
    ...(variants.french ? [AppLanguage.FR] : []),
  ];
  const locale = requested ?? AppLanguage.EN;
  const translation = published.find(
    (candidate) => candidate.locale === locale,
  );

  if (translation)
    return {
      record: overlay(record, translation),
      contentLanguage: locale,
      availableLocales,
      isRequestedAvailable: true,
    };

  const isRequestedAvailable =
    locale === AppLanguage.EN ? true : availableLocales.includes(locale);
  return {
    record,
    contentLanguage: variants.source,
    availableLocales,
    isRequestedAvailable,
  };
};

export interface TranslationStore<TTx> {
  transaction<TResult>(work: (tx: TTx) => Promise<TResult>): Promise<TResult>;
  findParent(tx: TTx, parentId: string): Promise<TranslationParent | null>;
  findTranslation(
    tx: TTx,
    parentId: string,
    locale: AppLanguage,
  ): Promise<TranslationRow | null>;
  create(
    tx: TTx,
    parentId: string,
    locale: AppLanguage,
    fields: TranslationFields,
    actorId: string,
  ): Promise<TranslationRow>;
  update(
    tx: TTx,
    translationId: string,
    expectedVersion: number,
    data: {
      fields?: TranslationFields;
      isPublished?: boolean;
      publishedAt?: Date | null;
      actorId: string;
    },
  ): Promise<number>;
  reload(tx: TTx, translationId: string): Promise<TranslationRow>;
  touchParent(tx: TTx, parentId: string): Promise<void>;
}

export type TranslationGuards = {
  notFound: () => Error;
  denied: () => Error;
};

export const translationConflict = () =>
  new ConflictException({
    code: ContentTranslationError.VERSION_CONFLICT,
    message: ContentTranslationError.VERSION_CONFLICT,
  });

export const translationIncomplete = () =>
  new BadRequestException({
    code: ContentTranslationError.INCOMPLETE,
    message: ContentTranslationError.INCOMPLETE,
  });

export const translationMissing = () =>
  new NotFoundException({
    code: ContentTranslationError.NOT_FOUND,
    message: ContentTranslationError.NOT_FOUND,
  });

export const translationDenied = (message: string) =>
  new ForbiddenException(message);

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

const authorize = async <TTx>(
  store: TranslationStore<TTx>,
  tx: TTx,
  parentId: string,
  actor: TranslationActor,
  guards: TranslationGuards,
) => {
  const parent = await store.findParent(tx, parentId);
  if (!parent || parent.deletedAt) throw guards.notFound();
  if (actor.role !== Role.ADMIN && parent.providerId !== actor.id)
    throw guards.denied();
  return parent;
};

export const saveContentTranslation = async <TTx>(
  store: TranslationStore<TTx>,
  guards: TranslationGuards,
  request: {
    actor: TranslationActor;
    parentId: string;
    locale: AppLanguage;
    fields: TranslationFields;
    expectedVersion?: number | null;
  },
): Promise<TranslationRow> => {
  const fields = cleanTranslationFields(request.fields);
  if (!fields.title || !fields.description) throw translationIncomplete();

  return store.transaction(async (tx) => {
    const parent = await authorize(
      store,
      tx,
      request.parentId,
      request.actor,
      guards,
    );
    const existing = await store.findTranslation(
      tx,
      request.parentId,
      request.locale,
    );

    if (!existing) {
      if (request.expectedVersion) throw translationConflict();
      try {
        return await store.create(
          tx,
          request.parentId,
          request.locale,
          fields,
          request.actor.id,
        );
      } catch (error) {
        throw isUniqueViolation(error) ? translationConflict() : error;
      }
    }

    if (request.expectedVersion !== existing.version)
      throw translationConflict();
    if (existing.isPublished && !isTranslationComplete(fields, parent))
      throw translationIncomplete();

    const updated = await store.update(tx, existing.id, existing.version, {
      fields,
      actorId: request.actor.id,
    });
    if (updated !== 1) throw translationConflict();
    if (existing.isPublished) await store.touchParent(tx, request.parentId);
    return store.reload(tx, existing.id);
  });
};

export const setContentTranslationPublication = async <TTx>(
  store: TranslationStore<TTx>,
  guards: TranslationGuards,
  request: {
    actor: TranslationActor;
    parentId: string;
    locale: AppLanguage;
    published: boolean;
    expectedVersion: number;
  },
): Promise<TranslationRow> =>
  store.transaction(async (tx) => {
    const parent = await authorize(
      store,
      tx,
      request.parentId,
      request.actor,
      guards,
    );
    const existing = await store.findTranslation(
      tx,
      request.parentId,
      request.locale,
    );
    if (!existing) throw translationMissing();
    if (request.expectedVersion !== existing.version)
      throw translationConflict();
    if (existing.isPublished === request.published) return existing;
    if (request.published && !isTranslationComplete(existing, parent))
      throw translationIncomplete();

    const updated = await store.update(tx, existing.id, existing.version, {
      isPublished: request.published,
      publishedAt: request.published ? new Date() : null,
      actorId: request.actor.id,
    });
    if (updated !== 1) throw translationConflict();
    await store.touchParent(tx, request.parentId);
    return store.reload(tx, existing.id);
  });

export const listContentTranslations = async <TTx>(
  store: TranslationStore<TTx>,
  guards: TranslationGuards,
  request: { actor: TranslationActor; parentId: string },
  read: (tx: TTx, parentId: string) => Promise<TranslationRow[]>,
) =>
  store.transaction(async (tx) => {
    await authorize(store, tx, request.parentId, request.actor, guards);
    return read(tx, request.parentId);
  });
