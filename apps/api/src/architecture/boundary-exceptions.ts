import type { BoundedContext } from "./domain-ownership";

export type BoundaryExceptionKind = "read" | "write" | "import" | "transaction";

export type BoundaryExceptionPhase = 2 | 3 | 4 | 5 | 6 | 7;

export type BoundaryException = {
  readonly id: string;
  readonly reason: string;
  readonly source: BoundedContext;
  readonly target: BoundedContext;
  readonly files: readonly string[];
  readonly models: readonly string[];
  readonly kind: BoundaryExceptionKind;
  readonly removalPhase: BoundaryExceptionPhase;
};

export const BOUNDARY_EXCEPTIONS = [
  {
    id: "EXC-021",
    source: "professional-development",
    target: "organization-management",
    kind: "import",
    files: [
      "apps/api/src/modules/external-learning/entities/paginated-external-learning.entity.ts",
      "apps/api/src/modules/external-learning/resolvers/external-learning.resolver.ts",
      "apps/api/src/modules/external-learning/services/external-learning.service.ts",
    ],
    models: [],
    reason:
      "external-learning imports @org/dtos/org-pagination.input and @org/entities/page-info.entity purely to reuse a pagination shape. Shared shapes belong in a platform-shared location, not in another domain.",
    removalPhase: 2,
  },
  {
    id: "EXC-022",
    source: "platform-administration",
    target: "organization-management",
    kind: "import",
    files: ["apps/api/src/modules/admin/entities/admin-org-detail.entity.ts"],
    models: [],
    reason:
      "The admin organization detail entity embeds @org/entities/org-settings.entity and org-department.entity, so a change to an Organization GraphQL entity silently reshapes the admin contract.",
    removalPhase: 2,
  },
  {
    id: "EXC-024",
    source: "platform-shared",
    target: "identity-access",
    kind: "import",
    files: ["apps/api/src/modules/app/app.module.ts"],
    models: [],
    reason:
      "The composition root registers JwtAuthGuard, RolesGuard and PasswordChangeGuard as global APP_GUARDs, so platform-shared depends on Identity's guard classes.",
    removalPhase: 2,
  },
  {
    id: "EXC-033",
    source: "learning-catalog",
    target: "identity-access",
    kind: "import",
    files: [
      "apps/api/src/modules/course/controllers/course-import.controller.ts",
      "apps/api/src/modules/course/resolvers/course.resolver.ts",
      "apps/api/src/modules/events/resolvers/event.resolver.ts",
      "apps/api/src/modules/landing/resolvers/landing.resolver.ts",
      "apps/api/src/modules/podcast/resolvers/podcast.resolver.ts",
      "apps/api/src/modules/youtube/resolvers/youtube.resolver.ts",
    ],
    models: [],
    reason:
      "Catalog resolvers and the course-import controller import @auth/decorators/* to declare public and role-restricted operations. The fix is to relocate the decorators to platform-shared, not to remove the usage.",
    removalPhase: 2,
  },
  {
    id: "EXC-034",
    source: "professional-development",
    target: "identity-access",
    kind: "import",
    files: [
      "apps/api/src/modules/external-learning/resolvers/external-learning.resolver.ts",
      "apps/api/src/modules/professional/controllers/professional-avatar.controller.ts",
      "apps/api/src/modules/professional/controllers/professional-certificate-file.controller.ts",
      "apps/api/src/modules/professional/controllers/professional-pdu-file.controller.ts",
      "apps/api/src/modules/professional/resolvers/professional-calendar.resolver.ts",
      "apps/api/src/modules/professional/resolvers/professional-certificate.resolver.ts",
      "apps/api/src/modules/professional/resolvers/professional-courses.resolver.ts",
      "apps/api/src/modules/professional/resolvers/professional-cpd-plan.resolver.ts",
      "apps/api/src/modules/professional/resolvers/professional-onboarding.resolver.ts",
      "apps/api/src/modules/professional/resolvers/professional-overview.resolver.ts",
      "apps/api/src/modules/professional/resolvers/professional-payments.resolver.ts",
      "apps/api/src/modules/professional/resolvers/professional-pdu.resolver.ts",
      "apps/api/src/modules/professional/resolvers/professional-profile.resolver.ts",
      "apps/api/src/modules/professional/resolvers/professional-roadmap.resolver.ts",
      "apps/api/src/modules/professional/resolvers/professional-roadmap-chat.resolver.ts",
      "apps/api/src/modules/professional/resolvers/professional-settings.resolver.ts",
    ],
    models: [],
    reason:
      "The largest consumer of the auth decorators: every professional resolver and upload controller, plus the external-learning resolver, which additionally imports @auth/types/jwt-payload.type.",
    removalPhase: 2,
  },
  {
    id: "EXC-035",
    source: "organization-management",
    target: "identity-access",
    kind: "import",
    files: [
      "apps/api/src/modules/organization/resolvers/org-access-request.resolver.ts",
      "apps/api/src/modules/organization/resolvers/org-dashboard-assignment.resolver.ts",
      "apps/api/src/modules/organization/resolvers/org-dashboard-cpd.resolver.ts",
      "apps/api/src/modules/organization/resolvers/org-dashboard-department.resolver.ts",
      "apps/api/src/modules/organization/resolvers/org-dashboard-member.resolver.ts",
      "apps/api/src/modules/organization/resolvers/org-dashboard.resolver.ts",
    ],
    models: [],
    reason:
      "Organization resolvers import @auth/decorators/* and, in org-dashboard.resolver.ts, @auth/guards/roles.guard directly.",
    removalPhase: 2,
  },
  {
    id: "EXC-036",
    source: "platform-administration",
    target: "identity-access",
    kind: "import",
    files: [
      "apps/api/src/modules/admin/resolvers/admin-org.resolver.ts",
      "apps/api/src/modules/admin/resolvers/admin.resolver.ts",
    ],
    models: [],
    reason:
      "Admin resolvers import @auth/decorators/* to restrict every operation to the ADMIN role.",
    removalPhase: 2,
  },
  {
    id: "EXC-037",
    source: "engagement",
    target: "identity-access",
    kind: "import",
    files: [
      "apps/api/src/modules/content-interaction/resolvers/content-interaction.resolver.ts",
      "apps/api/src/modules/content-interaction/resolvers/wishlist-content.resolver.ts",
    ],
    models: [],
    reason:
      "Engagement resolvers import @auth/decorators/* for the current-user and role decorators.",
    removalPhase: 2,
  },
  {
    id: "EXC-038",
    source: "provider-management",
    target: "identity-access",
    kind: "import",
    files: ["apps/api/src/modules/provider/resolvers/provider.resolver.ts"],
    models: [],
    reason:
      "The provider resolver imports @auth/decorators/* for the current-user and role decorators.",
    removalPhase: 2,
  },
  {
    id: "EXC-044",
    source: "platform-administration",
    target: "organization-management",
    kind: "import",
    files: ["apps/api/src/modules/admin/resolvers/admin-org.resolver.ts"],
    models: [],
    reason:
      "The admin organization resolver imports the Organization-owned settings GraphQL entity directly, making an internal transport type a cross-domain contract.",
    removalPhase: 2,
  },
  {
    id: "EXC-045",
    source: "engagement",
    target: "provider-management",
    kind: "import",
    files: [
      "apps/api/src/modules/content-interaction/resolvers/wishlist-content.resolver.ts",
    ],
    models: [],
    reason:
      "The wishlist resolver imports Provider service result types through the generic modules alias instead of an explicit public application contract.",
    removalPhase: 2,
  },
] as const satisfies readonly BoundaryException[];

export const BOUNDARY_EXCEPTION_COUNT = BOUNDARY_EXCEPTIONS.length;

export const IMPORT_EXCEPTION_FINGERPRINTS: Readonly<Record<string, string>> = {
  "EXC-021:apps/api/src/modules/external-learning/entities/paginated-external-learning.entity.ts":
    "d18a25ed11c64c7a6fffa609fa19c3016c9b56205c3af360e64f52bfc0e154d5",
  "EXC-021:apps/api/src/modules/external-learning/resolvers/external-learning.resolver.ts":
    "291351890e9dffad4c84e3a6a6b0cac89de08006ddd74509d2401832811f0cdd",
  "EXC-021:apps/api/src/modules/external-learning/services/external-learning.service.ts":
    "291351890e9dffad4c84e3a6a6b0cac89de08006ddd74509d2401832811f0cdd",
  "EXC-022:apps/api/src/modules/admin/entities/admin-org-detail.entity.ts":
    "a23b729335982b2bf3fd2f64fa5e746769c4f1dbe71bfea3aff9790f7056d7e5",
  "EXC-024:apps/api/src/modules/app/app.module.ts":
    "8a662e6232e8d5ab409497ee32c3be7f27ab0c1a675626f0d58819327bda61be",
  "EXC-033:apps/api/src/modules/course/controllers/course-import.controller.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-033:apps/api/src/modules/course/resolvers/course.resolver.ts":
    "b468d6e3ced9e4183e8d29d88cb24768abe006a8afb30fecc669e778dd28dbbe",
  "EXC-033:apps/api/src/modules/events/resolvers/event.resolver.ts":
    "b468d6e3ced9e4183e8d29d88cb24768abe006a8afb30fecc669e778dd28dbbe",
  "EXC-033:apps/api/src/modules/landing/resolvers/landing.resolver.ts":
    "9a9c6fd1636266769b98a077784176e3f16e3c69d83ce9da0cd0f40a439e209a",
  "EXC-033:apps/api/src/modules/podcast/resolvers/podcast.resolver.ts":
    "b468d6e3ced9e4183e8d29d88cb24768abe006a8afb30fecc669e778dd28dbbe",
  "EXC-033:apps/api/src/modules/youtube/resolvers/youtube.resolver.ts":
    "b468d6e3ced9e4183e8d29d88cb24768abe006a8afb30fecc669e778dd28dbbe",
  "EXC-034:apps/api/src/modules/external-learning/resolvers/external-learning.resolver.ts":
    "0a581135b0ab11ef660e956ef9d2f667970f7ed9cb9919e2d13c938824913d80",
  "EXC-034:apps/api/src/modules/professional/controllers/professional-avatar.controller.ts":
    "b468d6e3ced9e4183e8d29d88cb24768abe006a8afb30fecc669e778dd28dbbe",
  "EXC-034:apps/api/src/modules/professional/controllers/professional-certificate-file.controller.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-034:apps/api/src/modules/professional/controllers/professional-pdu-file.controller.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-034:apps/api/src/modules/professional/resolvers/professional-calendar.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-034:apps/api/src/modules/professional/resolvers/professional-certificate.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-034:apps/api/src/modules/professional/resolvers/professional-courses.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-034:apps/api/src/modules/professional/resolvers/professional-cpd-plan.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-034:apps/api/src/modules/professional/resolvers/professional-overview.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-034:apps/api/src/modules/professional/resolvers/professional-payments.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-034:apps/api/src/modules/professional/resolvers/professional-pdu.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-034:apps/api/src/modules/professional/resolvers/professional-onboarding.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-034:apps/api/src/modules/professional/resolvers/professional-profile.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-034:apps/api/src/modules/professional/resolvers/professional-roadmap.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-034:apps/api/src/modules/professional/resolvers/professional-roadmap-chat.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-034:apps/api/src/modules/professional/resolvers/professional-settings.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-035:apps/api/src/modules/organization/resolvers/org-access-request.resolver.ts":
    "29f4349d36728255e936fad50da2e3f2b626e8c7bd03085c6adddcd3ee9c3f30",
  "EXC-035:apps/api/src/modules/organization/resolvers/org-dashboard-assignment.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-035:apps/api/src/modules/organization/resolvers/org-dashboard-cpd.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-035:apps/api/src/modules/organization/resolvers/org-dashboard-department.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-035:apps/api/src/modules/organization/resolvers/org-dashboard-member.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-035:apps/api/src/modules/organization/resolvers/org-dashboard.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-036:apps/api/src/modules/admin/resolvers/admin-org.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-036:apps/api/src/modules/admin/resolvers/admin.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-037:apps/api/src/modules/content-interaction/resolvers/content-interaction.resolver.ts":
    "510bf5b95d431ceffcaadc1f47386fe4c741c05ff3d7bf912413810fb1794119",
  "EXC-037:apps/api/src/modules/content-interaction/resolvers/wishlist-content.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-038:apps/api/src/modules/provider/resolvers/provider.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-044:apps/api/src/modules/admin/resolvers/admin-org.resolver.ts":
    "41017e6c0e05c5f7e232b87f143569c53367addc53acbb0fbc24abb7f65ed5ac",
  "EXC-045:apps/api/src/modules/content-interaction/resolvers/wishlist-content.resolver.ts":
    "8e35393a2f04901503fb23559b679e960ff93d83c24e08b3e8c088986a0a87e3",
};
