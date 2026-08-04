/**
 * Typed ownership manifest for the modular monolith.
 *
 * This file is the machine-readable half of the Phase 1 baseline; the reasoning
 * lives in `context/modular-monolith-baseline.md` and the ADRs under
 * `context/architecture/`.
 *
 * It is deliberately framework-free — no `@nestjs/*`, no `@prisma/client`, no
 * imports at all — for two reasons. It must be readable by an ESLint rule and a
 * plain Node script in Phase 2, and importing Prisma here would make the
 * manifest depend on the very generated client whose models it is supposed to
 * describe.
 *
 * Model names are therefore string literals rather than `Prisma.ModelName`
 * members. That makes them a second source of truth, so
 * `domain-ownership.spec.ts` fails if this manifest and the Prisma schema ever
 * disagree. Prisma wins.
 *
 * Nothing in the application imports this file yet. Phase 2 turns it into the
 * input for automated boundary enforcement; until then its only consumer is its
 * own drift test.
 */

/** The bounded contexts approved by ADR-002. */
export const BOUNDED_CONTEXTS = {
  IDENTITY_ACCESS: "identity-access",
  LEARNING_CATALOG: "learning-catalog",
  PROFESSIONAL_DEVELOPMENT: "professional-development",
  ORGANIZATION_MANAGEMENT: "organization-management",
  PROVIDER_MANAGEMENT: "provider-management",
  ENGAGEMENT: "engagement",
  PLATFORM_ADMINISTRATION: "platform-administration",
  COMMUNICATIONS: "communications",
  PLATFORM_SHARED: "platform-shared",
} as const;

export type BoundedContext =
  (typeof BOUNDED_CONTEXTS)[keyof typeof BOUNDED_CONTEXTS];

export const BOUNDED_CONTEXT_VALUES = Object.values(BOUNDED_CONTEXTS);

/**
 * Every directory under `apps/api/src/modules` mapped to exactly one context.
 * Keys are directory names, not NestJS class names, because the enforcement
 * rule in Phase 2 resolves a file path to a context.
 */
export const MODULE_OWNERSHIP = {
  auth: BOUNDED_CONTEXTS.IDENTITY_ACCESS,
  user: BOUNDED_CONTEXTS.IDENTITY_ACCESS,

  course: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  events: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  podcast: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  youtube: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  landing: BOUNDED_CONTEXTS.LEARNING_CATALOG,

  professional: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  "external-learning": BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,

  organization: BOUNDED_CONTEXTS.ORGANIZATION_MANAGEMENT,
  provider: BOUNDED_CONTEXTS.PROVIDER_MANAGEMENT,
  "content-interaction": BOUNDED_CONTEXTS.ENGAGEMENT,
  admin: BOUNDED_CONTEXTS.PLATFORM_ADMINISTRATION,
  mail: BOUNDED_CONTEXTS.COMMUNICATIONS,

  app: BOUNDED_CONTEXTS.PLATFORM_SHARED,
  prisma: BOUNDED_CONTEXTS.PLATFORM_SHARED,
  graphql: BOUNDED_CONTEXTS.PLATFORM_SHARED,
} as const;

/**
 * Source directories that are not NestJS modules.
 *
 * `MODULE_OWNERSHIP` is keyed on directories under `src/modules`, so on its own
 * it cannot classify anything else — and `src/common` holds real code that a
 * boundary rule has to reason about (`graphql-error-formatter.ts`,
 * `slug.util.ts`, `oauth-roles.constant.ts`). A Phase 2 path-to-context resolver
 * that consulted only `MODULE_OWNERSHIP` would return `undefined` for those
 * files and either exempt them from every rule or crash.
 *
 * Paths are relative to `apps/api`, and are checked longest-prefix-first
 * because `src/modules` is itself a prefix of every module path.
 */
export const SOURCE_PATH_OWNERSHIP = {
  "src/common": BOUNDED_CONTEXTS.PLATFORM_SHARED,
  "src/graphql": BOUNDED_CONTEXTS.PLATFORM_SHARED,
  "src/architecture": BOUNDED_CONTEXTS.PLATFORM_SHARED,
} as const;

/**
 * Every Prisma model mapped to its single write owner.
 *
 * "Owner" means the one context allowed to write the model once the migration
 * completes. It is not a statement about who writes it today — several models
 * currently have writers outside their owner, and each of those is recorded in
 * `boundary-exceptions.ts` with a removal phase.
 */
export const MODEL_OWNERSHIP = {
  // Identity and Access
  User: BOUNDED_CONTEXTS.IDENTITY_ACCESS,
  AuthAccount: BOUNDED_CONTEXTS.IDENTITY_ACCESS,
  AuthSession: BOUNDED_CONTEXTS.IDENTITY_ACCESS,
  OtpCode: BOUNDED_CONTEXTS.IDENTITY_ACCESS,
  PendingRegistration: BOUNDED_CONTEXTS.IDENTITY_ACCESS,

  // Learning Catalog
  Course: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  CurriculumSection: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  CurriculumLesson: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  Event: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  EventScheduleItem: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  EventRegistration: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  Podcast: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  PodcastEpisode: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  YouTubeChannel: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  YouTubeVideo: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  Roadmap: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  RoadmapPhase: BOUNDED_CONTEXTS.LEARNING_CATALOG,
  RoadmapStep: BOUNDED_CONTEXTS.LEARNING_CATALOG,

  // Professional Development
  ProfessionalProfile: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  ProfileTaxonomyTerm: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  ProfessionalProfileTerm: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  ProfessionalCredential: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  ProfessionalSettings: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  PDUTarget: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  PDUActivity: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  PDUActivityFile: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  Certification: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  CertificationCategory: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  CPDPlan: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  CPDPlanCategory: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  Certificate: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  CertificateFile: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  CalendarEvent: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,
  ExternalLearningActivity: BOUNDED_CONTEXTS.PROFESSIONAL_DEVELOPMENT,

  // Organization Management
  Organization: BOUNDED_CONTEXTS.ORGANIZATION_MANAGEMENT,
  OrganizationProfile: BOUNDED_CONTEXTS.ORGANIZATION_MANAGEMENT,
  OrganizationSettings: BOUNDED_CONTEXTS.ORGANIZATION_MANAGEMENT,
  OrganizationDepartment: BOUNDED_CONTEXTS.ORGANIZATION_MANAGEMENT,
  OrganizationMember: BOUNDED_CONTEXTS.ORGANIZATION_MANAGEMENT,
  OrganizationCPDCategory: BOUNDED_CONTEXTS.ORGANIZATION_MANAGEMENT,
  OrganizationAssignment: BOUNDED_CONTEXTS.ORGANIZATION_MANAGEMENT,
  OrganizationAssignmentRecipient: BOUNDED_CONTEXTS.ORGANIZATION_MANAGEMENT,
  OrganizationAccessRequest: BOUNDED_CONTEXTS.ORGANIZATION_MANAGEMENT,

  // Provider Management
  ProviderProfile: BOUNDED_CONTEXTS.PROVIDER_MANAGEMENT,
  ProviderSettings: BOUNDED_CONTEXTS.PROVIDER_MANAGEMENT,
  EventPromotionRequest: BOUNDED_CONTEXTS.PROVIDER_MANAGEMENT,

  // Engagement
  WishlistItem: BOUNDED_CONTEXTS.ENGAGEMENT,
  ContentEnrollment: BOUNDED_CONTEXTS.ENGAGEMENT,
  ContentReview: BOUNDED_CONTEXTS.ENGAGEMENT,
  Cart: BOUNDED_CONTEXTS.ENGAGEMENT,
  CartItem: BOUNDED_CONTEXTS.ENGAGEMENT,
  RoadmapEnrollment: BOUNDED_CONTEXTS.ENGAGEMENT,
  Payment: BOUNDED_CONTEXTS.ENGAGEMENT,

  // Platform Administration
  AuditLog: BOUNDED_CONTEXTS.PLATFORM_ADMINISTRATION,
} as const;

/**
 * Allowed dependency direction between contexts, per ADR-002.
 *
 * A context may depend on itself implicitly and on every context listed here.
 * Anything else is a violation. The graph must stay acyclic: `communications`
 * and `platform-shared` are sinks, and no context may depend on
 * `platform-administration`.
 */
export const DOMAIN_DEPENDENCIES = {
  "identity-access": ["communications", "platform-shared"],
  "learning-catalog": ["platform-shared"],
  "professional-development": ["platform-shared"],
  "organization-management": ["communications", "platform-shared"],
  "provider-management": ["platform-shared"],
  engagement: ["learning-catalog", "platform-shared"],
  "platform-administration": [
    "identity-access",
    "organization-management",
    "communications",
    "platform-shared",
  ],
  communications: ["platform-shared"],
  "platform-shared": [],
} as const satisfies Record<BoundedContext, readonly BoundedContext[]>;

/**
 * Contexts that own no Prisma model.
 *
 * Recorded explicitly so the drift test can tell "owns nothing by design" apart
 * from "someone forgot to assign a model".
 */
export const MODEL_FREE_CONTEXTS = [
  BOUNDED_CONTEXTS.COMMUNICATIONS,
  BOUNDED_CONTEXTS.PLATFORM_SHARED,
] as const;
