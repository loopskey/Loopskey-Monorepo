/**
 * Register of every boundary violation that exists today.
 *
 * Phase 1 changes no behavior, so every cross-domain read, write and import
 * found by the baseline audit is recorded here instead of being fixed. The
 * register is the contract between Phase 1 and Phase 2: Phase 2 turns the
 * ownership manifest into an enforced rule and allows exactly these entries
 * through, so a violation that is absent from this list is a new one.
 *
 * Rules for changing this file:
 *
 * - Never add an entry to make a new violation pass. Fix the code instead.
 * - Every entry needs a removal phase. An exception without an end date is a
 *   permanent architecture decision wearing a temporary label, and belongs in
 *   an ADR rather than here.
 * - Deleting an entry is the deliverable of the phase that owns it. The
 *   exception count must fall monotonically from Phase 3 onward.
 *
 * Evidence and reasoning for each entry: `context/modular-monolith-baseline.md`.
 * Framework-free for the same reason as `domain-ownership.ts`.
 */

import type { BoundedContext } from "./domain-ownership";

/**
 * How the source context reaches into the target.
 *
 * - `write` — the source changes rows the target owns, so neither context owns
 *   the invariant. The severe class.
 * - `read` — the source queries the target's tables, coupling it to a schema it
 *   does not control.
 * - `import` — a compile-time dependency on another context's code, with no
 *   database access.
 * - `transaction` — one `$transaction` commits writes belonging to two
 *   contexts. This is *not* a restatement of the underlying `write` entries: it
 *   records the atomicity coupling, which is the thing that actually blocks the
 *   split, and it is the violation ADR-003's "one transaction, one context" rule
 *   removes. The row writes keep their own `write` entries.
 *
 * `import` and `transaction` extend the read/write classification the Phase 1
 * specification asked for. Both were added because the codebase contains
 * violations that are genuinely neither a read nor a write, and both are
 * ratified in the spec and in ADR-003.
 */
export type BoundaryExceptionKind = "read" | "write" | "import" | "transaction";

/**
 * Roadmap phase that must delete the exception.
 *
 * 2 = boundary enforcement, 3 = events pilot, 4 = catalog and engagement,
 * 5 = identity/organization/administration, 6 = professional development,
 * 7 = reliability and operations.
 */
export type BoundaryExceptionPhase = 2 | 3 | 4 | 5 | 6 | 7;

export type BoundaryException = {
  /** Stable identifier. Never reuse an ID after its exception is removed. */
  readonly id: string;
  readonly source: BoundedContext;
  readonly target: BoundedContext;
  readonly kind: BoundaryExceptionKind;
  /** Repo-relative paths that contain the violation. */
  readonly files: readonly string[];
  /** Prisma models involved, or an empty list for a pure code import. */
  readonly models: readonly string[];
  readonly reason: string;
  readonly removalPhase: BoundaryExceptionPhase;
};

export const BOUNDARY_EXCEPTIONS = [
  // ---------------------------------------------------------------------
  // Cross-domain writes. Two contexts can change the same rows today.
  // ---------------------------------------------------------------------
  {
    id: "EXC-002",
    source: "engagement",
    target: "learning-catalog",
    kind: "write",
    files: [
      "apps/api/src/modules/content-interaction/services/content-interaction.service.ts",
    ],
    models: ["Course", "Event", "Podcast", "YouTubeChannel"],
    reason:
      "Submitting a ContentReview recomputes the average and writes rating/ratingCount back onto all four catalog models. The derived value belongs to the catalog and should be published to it, not written by Engagement.",
    removalPhase: 4,
  },
  {
    id: "EXC-003",
    source: "platform-administration",
    target: "identity-access",
    kind: "write",
    files: ["apps/api/src/modules/admin/services/admin.service.ts"],
    models: ["User"],
    reason:
      "Approving an organization access request creates the owner User account and updates User rows directly, bypassing Identity's own account-creation rules.",
    removalPhase: 5,
  },
  {
    id: "EXC-004",
    source: "platform-administration",
    target: "organization-management",
    kind: "write",
    files: [
      "apps/api/src/modules/admin/services/admin.service.ts",
      "apps/api/src/modules/admin/services/admin-org.service.ts",
      "apps/api/src/modules/admin/services/organization-review-notification.service.ts",
    ],
    models: [
      "Organization",
      "OrganizationProfile",
      "OrganizationSettings",
      "OrganizationMember",
      "OrganizationAccessRequest",
    ],
    reason:
      "Platform Administration provisions organizations and its notification service also updates delivery state on OrganizationAccessRequest directly, so both workflows bypass the Organization owner.",
    removalPhase: 5,
  },
  {
    id: "EXC-005",
    source: "organization-management",
    target: "identity-access",
    kind: "write",
    files: [
      "apps/api/src/modules/organization/services/org-dashboard-member.service.ts",
    ],
    models: ["User"],
    reason:
      "Adding an organization member upserts a User row and updates it inside the membership transaction, so Organization can create accounts.",
    removalPhase: 5,
  },
  {
    id: "EXC-006",
    source: "professional-development",
    target: "identity-access",
    kind: "write",
    files: [
      "apps/api/src/modules/professional/services/professional-avatar.service.ts",
      "apps/api/src/modules/professional/services/professional-profile.service.ts",
    ],
    models: ["User"],
    reason:
      "Avatar upload and basic-profile edit write User.avatarUrl and User.fullName, because those two display fields live on User rather than on ProfessionalProfile.",
    removalPhase: 6,
  },
  {
    id: "EXC-007",
    source: "identity-access",
    target: "platform-administration",
    kind: "write",
    files: [
      "apps/api/src/modules/auth/services/auth-organization-activation.service.ts",
    ],
    models: ["AuditLog"],
    reason:
      "Activation writes AuditLog rows directly. Auditing is a platform capability and should be reached through a port rather than by writing another context's table.",
    removalPhase: 7,
  },
  {
    id: "EXC-008",
    source: "organization-management",
    target: "platform-administration",
    kind: "write",
    files: [
      "apps/api/src/modules/organization/services/org-access-request.service.ts",
    ],
    models: ["AuditLog"],
    reason:
      "Access-request submission writes an AuditLog row inside its own transaction. Same reasoning as EXC-007; the transactional coupling is what makes it worth an outbox in Phase 7.",
    removalPhase: 7,
  },

  // ---------------------------------------------------------------------
  // Cross-domain reads. The source is coupled to the target's schema.
  // ---------------------------------------------------------------------
  {
    id: "EXC-009",
    source: "engagement",
    target: "learning-catalog",
    kind: "read",
    files: [
      "apps/api/src/modules/content-interaction/services/content-interaction.service.ts",
      "apps/api/src/modules/content-interaction/services/wishlist-content.service.ts",
    ],
    models: [
      "Course",
      "Event",
      "Podcast",
      "YouTubeChannel",
      "EventRegistration",
    ],
    reason:
      "Wishlist and interaction resolve a polymorphic contentId against all four catalog tables and project their display fields, and read the caller's existing EventRegistration before toggling it.",
    removalPhase: 4,
  },
  {
    id: "EXC-010",
    source: "professional-development",
    target: "learning-catalog",
    kind: "read",
    files: [
      "apps/api/src/modules/professional/services/professional-courses.service.ts",
      "apps/api/src/modules/professional/services/professional-roadmap.service.ts",
      "apps/api/src/modules/professional/services/professional-calendar.service.ts",
      "apps/api/src/modules/professional/services/professional-overview.service.ts",
    ],
    models: [
      "Course",
      "Roadmap",
      "RoadmapPhase",
      "RoadmapStep",
      "EventRegistration",
    ],
    reason:
      "The professional dashboard reads catalog content and event registrations to build My Courses, roadmap progress, the calendar and the overview cards.",
    removalPhase: 6,
  },
  {
    id: "EXC-011",
    source: "professional-development",
    target: "engagement",
    kind: "read",
    files: [
      "apps/api/src/modules/professional/services/professional-courses.service.ts",
      "apps/api/src/modules/professional/services/professional-overview.service.ts",
      "apps/api/src/modules/professional/services/professional-roadmap.service.ts",
      "apps/api/src/modules/professional/services/professional-payments.service.ts",
    ],
    models: ["ContentEnrollment", "RoadmapEnrollment", "Payment"],
    reason:
      "Enrollment and payment history are Engagement records read directly to build professional progress and the payments overview.",
    removalPhase: 6,
  },
  {
    id: "EXC-012",
    source: "professional-development",
    target: "identity-access",
    kind: "read",
    files: [
      "apps/api/src/modules/professional/services/professional-avatar.service.ts",
      "apps/api/src/modules/professional/services/professional-cpd-plan.service.ts",
      "apps/api/src/modules/professional/services/professional-overview.service.ts",
      "apps/api/src/modules/professional/services/professional-profile.service.ts",
      "apps/api/src/modules/professional/services/professional-settings.service.ts",
    ],
    models: ["User", "AuthSession"],
    reason:
      "Profile and settings screens read User identity fields and list active AuthSession rows for the security panel.",
    removalPhase: 6,
  },
  {
    id: "EXC-013",
    source: "provider-management",
    target: "learning-catalog",
    kind: "read",
    files: ["apps/api/src/modules/provider/services/provider.service.ts"],
    models: ["Event", "EventRegistration"],
    reason:
      "Provider analytics, the events list and the attendees export are read models over catalog data. Provider writes no catalog row, so this is the cheapest exception class to convert to a published read model.",
    removalPhase: 4,
  },
  {
    id: "EXC-014",
    source: "provider-management",
    target: "identity-access",
    kind: "read",
    files: ["apps/api/src/modules/provider/services/provider.service.ts"],
    models: ["User"],
    reason:
      "The attendee list projects the registered user's name and email from User.",
    removalPhase: 5,
  },
  {
    id: "EXC-015",
    source: "organization-management",
    target: "learning-catalog",
    kind: "read",
    files: [
      "apps/api/src/modules/organization/services/org-dashboard.service.ts",
      "apps/api/src/modules/organization/services/org-dashboard-assignment.service.ts",
    ],
    models: ["Course", "Event"],
    reason:
      "The organization event catalog and assignment targets read catalog rows to let an administrator assign platform content to members.",
    removalPhase: 4,
  },
  {
    id: "EXC-016",
    source: "organization-management",
    target: "identity-access",
    kind: "read",
    files: [
      "apps/api/src/modules/organization/services/org-access-request.service.ts",
      "apps/api/src/modules/organization/services/org-dashboard-member.service.ts",
    ],
    models: ["User"],
    reason:
      "Member management and duplicate-request detection look up User rows by email.",
    removalPhase: 5,
  },
  {
    id: "EXC-017",
    source: "platform-administration",
    target: "identity-access",
    kind: "read",
    files: ["apps/api/src/modules/admin/services/admin.service.ts"],
    models: ["User"],
    reason:
      "The admin user directory reads, filters and paginates User directly. This is a legitimate administrative read projection, but it still binds the admin screens to Identity's schema.",
    removalPhase: 5,
  },
  {
    id: "EXC-018",
    source: "platform-administration",
    target: "organization-management",
    kind: "read",
    files: [
      "apps/api/src/modules/admin/services/admin.service.ts",
      "apps/api/src/modules/admin/services/admin-org.service.ts",
      "apps/api/src/modules/admin/services/organization-review-notification.service.ts",
    ],
    models: [
      "Organization",
      "OrganizationMember",
      "OrganizationSettings",
      "OrganizationAccessRequest",
      "OrganizationDepartment",
    ],
    reason:
      "Admin organization screens read Organization tables directly, and notification delivery reads OrganizationAccessRequest state before sending or retrying mail.",
    removalPhase: 5,
  },
  {
    id: "EXC-019",
    source: "platform-administration",
    target: "provider-management",
    kind: "read",
    files: ["apps/api/src/modules/admin/services/admin.service.ts"],
    models: ["ProviderProfile"],
    reason:
      "The admin provider list includes ProviderProfile through a nested Prisma include and filters on its isPremium flag.",
    removalPhase: 5,
  },
  {
    id: "EXC-020",
    source: "professional-development",
    target: "provider-management",
    kind: "read",
    files: [
      "apps/api/src/modules/professional/services/professional-courses.service.ts",
    ],
    models: ["ProviderProfile"],
    reason:
      "My Courses shows the publishing provider's organization name via a nested ProviderProfile include.",
    removalPhase: 6,
  },

  // ---------------------------------------------------------------------
  // Role-profile provisioning. These are nested relation writes
  // (`professionalProfile: { create: … }`) inside a `user` create, so they do
  // not appear as a top-level `prisma.professionalProfile.create` call and were
  // missed by the first pass of the baseline audit. Architecturally they are
  // the same thing as EXC-003: one context creating another's aggregate.
  // ---------------------------------------------------------------------
  {
    id: "EXC-026",
    source: "identity-access",
    target: "professional-development",
    kind: "write",
    files: [
      "apps/api/src/modules/auth/services/auth-registration.service.ts",
      "apps/api/src/modules/user/services/user.service.ts",
    ],
    models: ["ProfessionalProfile"],
    reason:
      "Registration and admin user-creation build the ProfessionalProfile row as a nested create on User, so Identity decides what an empty professional profile looks like.",
    removalPhase: 5,
  },
  {
    id: "EXC-027",
    source: "identity-access",
    target: "provider-management",
    kind: "write",
    files: [
      "apps/api/src/modules/auth/services/auth-registration.service.ts",
      "apps/api/src/modules/user/services/user.service.ts",
    ],
    models: ["ProviderProfile"],
    reason:
      "Same pattern for providers: ProviderProfile is created as a nested relation write during registration and user creation.",
    removalPhase: 5,
  },
  {
    id: "EXC-028",
    source: "identity-access",
    target: "organization-management",
    kind: "write",
    files: ["apps/api/src/modules/user/services/user.service.ts"],
    models: ["OrganizationProfile"],
    reason:
      "Admin-facing user creation nests an OrganizationProfile create, giving Identity a second path to create an organization profile alongside EXC-004.",
    removalPhase: 5,
  },
  {
    id: "EXC-029",
    source: "organization-management",
    target: "professional-development",
    kind: "write",
    files: [
      "apps/api/src/modules/organization/services/org-dashboard-member.service.ts",
    ],
    models: ["ProfessionalProfile"],
    reason:
      "Adding an organization member nests a ProfessionalProfile create in the same upsert that creates the User, so Organization provisions professional profiles too.",
    removalPhase: 5,
  },
  {
    id: "EXC-030",
    source: "identity-access",
    target: "professional-development",
    kind: "read",
    files: ["apps/api/src/modules/user/services/user.service.ts"],
    models: ["ProfessionalProfile"],
    reason:
      "The shared user select includes the full ProfessionalProfile row, so every user read projects another context's table.",
    removalPhase: 5,
  },
  {
    id: "EXC-031",
    source: "identity-access",
    target: "provider-management",
    kind: "read",
    files: ["apps/api/src/modules/user/services/user.service.ts"],
    models: ["ProviderProfile"],
    reason: "Same shared user select includes the full ProviderProfile row.",
    removalPhase: 5,
  },
  {
    id: "EXC-032",
    source: "identity-access",
    target: "organization-management",
    kind: "read",
    files: [
      "apps/api/src/modules/user/services/user.service.ts",
      "apps/api/src/modules/auth/services/auth-organization-activation.service.ts",
    ],
    models: ["OrganizationProfile"],
    reason:
      "The shared user select includes OrganizationProfile, and activation reads organizationName from it to personalise the invitation email.",
    removalPhase: 5,
  },

  // ---------------------------------------------------------------------
  // Compile-time imports across contexts, with no database access.
  // ---------------------------------------------------------------------
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
    id: "EXC-023",
    source: "communications",
    target: "identity-access",
    kind: "import",
    files: ["apps/api/src/modules/mail/mail.service.ts"],
    models: [],
    reason:
      "MailService imports AuthMessageCode from @auth/enums/message-code.enum while AuthModule imports MailModule. That is a file-level cycle between the two contexts and the only edge that makes the current graph cyclic.",
    removalPhase: 2,
  },
  {
    id: "EXC-025",
    source: "platform-administration",
    target: "identity-access",
    kind: "import",
    files: [
      "apps/api/src/modules/admin/services/organization-review-notification.service.ts",
    ],
    models: [],
    reason:
      "Admin injects the concrete AuthOrganizationActivationService class. The dependency direction is allowed, but depending on a concrete service exposes Identity's whole internal surface instead of a published port.",
    removalPhase: 5,
  },

  // EXC-024 and EXC-033..EXC-038 are one violation with seven sources: the auth
  // decorators and guards are a cross-cutting platform concern that happens to
  // live inside the Identity module. They are recorded per source context rather
  // than as a single entry, because `source` is what Phase 2 matches on — a
  // single entry naming one source would fail to permit the other six.
  // `user` imports the same decorators but is itself identity-access, so that is
  // intra-context and correctly has no entry.
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
      "apps/api/src/modules/professional/resolvers/professional-overview.resolver.ts",
      "apps/api/src/modules/professional/resolvers/professional-payments.resolver.ts",
      "apps/api/src/modules/professional/resolvers/professional-pdu.resolver.ts",
      "apps/api/src/modules/professional/resolvers/professional-profile.resolver.ts",
      "apps/api/src/modules/professional/resolvers/professional-roadmap.resolver.ts",
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

  // ---------------------------------------------------------------------
  // Cross-context transactions. One `$transaction` commits writes owned by two
  // contexts, so the atomicity itself is the violation. Removing these means
  // deciding what replaces the guarantee, not merely moving a call.
  // ---------------------------------------------------------------------
  {
    id: "EXC-039",
    source: "platform-administration",
    target: "identity-access",
    kind: "transaction",
    files: ["apps/api/src/modules/admin/services/admin.service.ts"],
    models: ["User"],
    reason:
      "Organization approval creates the owner User inside the same transaction that claims the access request and provisions the organization, so account creation cannot fail independently of approval.",
    removalPhase: 5,
  },
  {
    id: "EXC-040",
    source: "platform-administration",
    target: "organization-management",
    kind: "transaction",
    files: ["apps/api/src/modules/admin/services/admin.service.ts"],
    models: [
      "Organization",
      "OrganizationProfile",
      "OrganizationSettings",
      "OrganizationMember",
      "OrganizationAccessRequest",
    ],
    reason:
      "The same transaction provisions the whole organization aggregate. It protects two real guarantees — all-or-nothing provisioning, and a single winner among concurrent reviewers — so Phase 5 must state what replaces each before the contexts are split.",
    removalPhase: 5,
  },
  {
    id: "EXC-041",
    source: "organization-management",
    target: "identity-access",
    kind: "transaction",
    files: [
      "apps/api/src/modules/organization/services/org-dashboard-member.service.ts",
    ],
    models: ["User"],
    reason:
      "Adding a member upserts the User and the OrganizationMember in one transaction, so an invited account and its membership are created atomically.",
    removalPhase: 5,
  },
  {
    id: "EXC-042",
    source: "professional-development",
    target: "identity-access",
    kind: "transaction",
    files: [
      "apps/api/src/modules/professional/services/professional-profile.service.ts",
    ],
    models: ["User"],
    reason:
      "Updating the basic profile writes User.fullName and ProfessionalProfile in one transaction, because the display name lives on the identity aggregate.",
    removalPhase: 6,
  },
  {
    id: "EXC-043",
    source: "organization-management",
    target: "platform-administration",
    kind: "transaction",
    files: [
      "apps/api/src/modules/organization/services/org-access-request.service.ts",
    ],
    models: ["AuditLog"],
    reason:
      "Access-request submission writes the request and its audit row in one transaction. This is the case the Phase 7 outbox exists for: the audit row must not be lost, so it cannot become a fire-and-forget event earlier.",
    removalPhase: 7,
  },
] as const satisfies readonly BoundaryException[];

/**
 * Size of the register.
 *
 * Pinned by `domain-ownership.spec.ts` so the count can only change when
 * somebody deliberately updates the assertion. The roadmap requires this number
 * to fall monotonically from Phase 3 onward; an accidental increase should break
 * a build, not pass unnoticed.
 */
export const BOUNDARY_EXCEPTION_COUNT = BOUNDARY_EXCEPTIONS.length;

/**
 * SHA-256 of the sorted import specifiers reaching each import exception's
 * target. This makes an exception approve an exact edge set, not an entire
 * source file in which arbitrary new dependencies could otherwise hide.
 */
export const IMPORT_EXCEPTION_FINGERPRINTS: Readonly<Record<string, string>> = {
  "EXC-021:apps/api/src/modules/external-learning/entities/paginated-external-learning.entity.ts":
    "d18a25ed11c64c7a6fffa609fa19c3016c9b56205c3af360e64f52bfc0e154d5",
  "EXC-021:apps/api/src/modules/external-learning/resolvers/external-learning.resolver.ts":
    "291351890e9dffad4c84e3a6a6b0cac89de08006ddd74509d2401832811f0cdd",
  "EXC-021:apps/api/src/modules/external-learning/services/external-learning.service.ts":
    "291351890e9dffad4c84e3a6a6b0cac89de08006ddd74509d2401832811f0cdd",
  "EXC-022:apps/api/src/modules/admin/entities/admin-org-detail.entity.ts":
    "a23b729335982b2bf3fd2f64fa5e746769c4f1dbe71bfea3aff9790f7056d7e5",
  "EXC-023:apps/api/src/modules/mail/mail.service.ts":
    "f9f0496ac9745c6c6fe982e94f83adaef77e79c9417f62a366183552029d26e2",
  "EXC-025:apps/api/src/modules/admin/services/organization-review-notification.service.ts":
    "9b399cad1b2ca2bfe7a8aafb97c97a98579e3ef1bb47db4e959b2c631897fca8",
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
  "EXC-034:apps/api/src/modules/professional/resolvers/professional-profile.resolver.ts":
    "6710421fcb0917e757c5a1d7af793564f3cb2b618246015a06e247aff90fb750",
  "EXC-034:apps/api/src/modules/professional/resolvers/professional-roadmap.resolver.ts":
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
