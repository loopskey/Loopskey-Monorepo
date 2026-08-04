export const BOUNDED_CONTEXTS = {
  ENGAGEMENT: "engagement",
  COMMUNICATIONS: "communications",
  PLATFORM_SHARED: "platform-shared",
  IDENTITY_ACCESS: "identity-access",
  LEARNING_CATALOG: "learning-catalog",
  PROVIDER_MANAGEMENT: "provider-management",
  ORGANIZATION_MANAGEMENT: "organization-management",
  PLATFORM_ADMINISTRATION: "platform-administration",
  PROFESSIONAL_DEVELOPMENT: "professional-development",
} as const;

export type BoundedContext =
  (typeof BOUNDED_CONTEXTS)[keyof typeof BOUNDED_CONTEXTS];

export const BOUNDED_CONTEXT_VALUES = Object.values(BOUNDED_CONTEXTS);

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

export const SOURCE_PATH_OWNERSHIP = {
  "src/common": BOUNDED_CONTEXTS.PLATFORM_SHARED,
  "src/graphql": BOUNDED_CONTEXTS.PLATFORM_SHARED,
  "src/architecture": BOUNDED_CONTEXTS.PLATFORM_SHARED,
} as const;

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

export const DOMAIN_DEPENDENCIES = {
  "identity-access": ["communications", "platform-shared"],
  "learning-catalog": ["platform-shared"],
  "professional-development": [
    "engagement",
    "identity-access",
    "learning-catalog",
    "platform-shared",
    "provider-management",
  ],
  "organization-management": [
    "communications",
    "identity-access",
    "learning-catalog",
    "platform-shared",
    "professional-development",
  ],
  "provider-management": [
    "identity-access",
    "learning-catalog",
    "platform-shared",
  ],
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

export const MODEL_FREE_CONTEXTS = [
  BOUNDED_CONTEXTS.COMMUNICATIONS,
  BOUNDED_CONTEXTS.PLATFORM_SHARED,
] as const;
