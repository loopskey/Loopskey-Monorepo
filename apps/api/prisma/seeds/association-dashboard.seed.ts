import * as P from "@prisma/client";
import { faker } from "@faker-js/faker";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { mkdir, writeFile } from "fs/promises";
import { join, resolve } from "path";

const ASSOCIATION_FAKE_PREFIX = "association-dashboard-seed";

// The lines below to the "compliance attribution (inlined)" marker are a
// verbatim copy of the pure functions in
// src/modules/association/utils/compliance-attribution.util.ts, duplicated
// rather than imported so this seed script stays runnable from the deployed
// API image, which ships apps/api/prisma and apps/api/dist but not
// apps/api/src (see Dockerfile.api). Keep this in sync if that file changes.
const DAY_MS = 24 * 60 * 60 * 1000;

type AttributionActivity = {
  id: string;
  date: Date;
  status: string;
  credits: number;
  category: string;
  creditType: string;
  hasEvidence: boolean;
};

type AttributionRequirement = {
  deadline: Date | null;
  creditType: P.CreditType;
  gracePeriodDays: number;
  reportingEnd: Date | null;
  reportingStart: Date | null;
  evidencePolicy: P.AssociationEvidencePolicy;
  lateSubmissionPolicy: P.AssociationLateSubmissionPolicy;
  categories: { id: string; mappedCategory: P.PDUCategory }[];
};

type AttributionAssignment = {
  cycleStart: Date;
  cycleEnd: Date | null;
};

type EffectiveWindow = {
  to: Date | null;
  from: Date | null;
  lateFrom: Date | null;
};

type Attribution = {
  isLate: boolean;
  activityDate: Date;
  activityId: string;
  creditedAmount: number;
  categoryId: string | null;
  state: P.AssociationAttributionState;
};

const latest = (left: Date | null, right: Date | null) => {
  if (!left) return right;
  if (!right) return left;
  return left.getTime() >= right.getTime() ? left : right;
};

const earliest = (left: Date | null, right: Date | null) => {
  if (!left) return right;
  if (!right) return left;
  return left.getTime() <= right.getTime() ? left : right;
};

const effectiveWindow = (
  requirement: AttributionRequirement,
  assignment: AttributionAssignment,
): EffectiveWindow => {
  const from = latest(assignment.cycleStart, requirement.reportingStart);
  const hardEnd = earliest(assignment.cycleEnd, requirement.reportingEnd);
  const to = earliest(hardEnd, requirement.deadline);
  if (
    requirement.lateSubmissionPolicy ===
      P.AssociationLateSubmissionPolicy.NOT_ACCEPTED ||
    !to
  )
    return { from, to, lateFrom: null };
  return {
    from,
    to,
    lateFrom: new Date(to.getTime() + requirement.gracePeriodDays * DAY_MS),
  };
};

const withinWindow = (
  date: Date,
  window: EffectiveWindow,
  lateSubmissionPolicy: P.AssociationLateSubmissionPolicy,
) => {
  const at = date.getTime();
  if (window.from && at < window.from.getTime()) return null;
  if (!window.to || at <= window.to.getTime()) return { isLate: false };
  if (window.lateFrom && at <= window.lateFrom.getTime())
    return {
      isLate:
        lateSubmissionPolicy ===
        P.AssociationLateSubmissionPolicy.ACCEPTED_FLAGGED_LATE,
    };
  return null;
};

const stateFor = (
  activity: AttributionActivity,
  policy: P.AssociationEvidencePolicy,
): P.AssociationAttributionState | null => {
  if (activity.status === P.PDUStatus.REJECTED)
    return P.AssociationAttributionState.REJECTED;
  if (policy === P.AssociationEvidencePolicy.NOT_REQUIRED)
    return P.AssociationAttributionState.COUNTED;
  if (!activity.hasEvidence) return null;
  if (policy === P.AssociationEvidencePolicy.REQUIRED_NO_REVIEW)
    return P.AssociationAttributionState.COUNTED;
  return activity.status === P.PDUStatus.APPROVED
    ? P.AssociationAttributionState.COUNTED
    : P.AssociationAttributionState.AWAITING_REVIEW;
};

const attributionFor = (
  activity: AttributionActivity,
  requirement: AttributionRequirement,
  assignment: AttributionAssignment,
): Attribution | null => {
  if (activity.creditType !== requirement.creditType) return null;
  const placement = withinWindow(
    activity.date,
    effectiveWindow(requirement, assignment),
    requirement.lateSubmissionPolicy,
  );
  if (!placement) return null;
  const state = stateFor(activity, requirement.evidencePolicy);
  if (!state) return null;
  const category = requirement.categories.find(
    (candidate) => candidate.mappedCategory === activity.category,
  );
  return {
    activityId: activity.id,
    categoryId: category?.id ?? null,
    creditedAmount:
      state === P.AssociationAttributionState.COUNTED
        ? Math.max(0, activity.credits)
        : 0,
    activityDate: activity.date,
    isLate: placement.isLate,
    state,
  };
};

type AssignmentTotals = {
  percent: number;
  completedCredits: number;
  isMissingEvidence: boolean;
  awaitingReviewCount: number;
  uncategorisedCredits: number;
  byCategory: Map<string, number>;
};

const totalsFor = (
  attributions: Attribution[],
  requiredCredits: number,
): AssignmentTotals => {
  const byCategory = new Map<string, number>();
  let completedCredits = 0;
  let uncategorisedCredits = 0;
  let awaitingReviewCount = 0;

  for (const attribution of attributions) {
    if (attribution.state === P.AssociationAttributionState.AWAITING_REVIEW) {
      awaitingReviewCount += 1;
      continue;
    }
    if (attribution.state !== P.AssociationAttributionState.COUNTED) continue;
    completedCredits += attribution.creditedAmount;
    if (!attribution.categoryId) {
      uncategorisedCredits += attribution.creditedAmount;
      continue;
    }
    byCategory.set(
      attribution.categoryId,
      (byCategory.get(attribution.categoryId) ?? 0) +
        attribution.creditedAmount,
    );
  }

  return {
    completedCredits,
    byCategory,
    uncategorisedCredits,
    awaitingReviewCount,
    isMissingEvidence: awaitingReviewCount > 0,
    percent:
      requiredCredits > 0
        ? (completedCredits / requiredCredits) * 100
        : completedCredits > 0
          ? 100
          : 0,
  };
};

type BandInput = {
  percent: number;
  awaitingReviewCount: number;
  onTrackThreshold: number;
};

const bandFor = ({
  percent,
  awaitingReviewCount,
  onTrackThreshold,
}: BandInput): P.AssociationComplianceBand => {
  if (percent >= 100 && awaitingReviewCount === 0)
    return P.AssociationComplianceBand.RENEWAL_READY;
  if (percent >= onTrackThreshold) return P.AssociationComplianceBand.ON_TRACK;
  if (percent <= 0) return P.AssociationComplianceBand.NOT_STARTED;
  return P.AssociationComplianceBand.AT_RISK;
};
// -------------------- end compliance attribution (inlined) -----------------

type AssociationOwnerSeedUser = {
  id: string;
  email: string | null;
  fullName: string | null;
};

type ProfessionalSeedUser = {
  id: string;
  email: string | null;
  fullName: string | null;
};

type GroupSeedItem = {
  id: string;
  title: string;
};

type MemberSeedItem = {
  id: string;
  userId: string;
  groupId: string | null;
  status: P.AssociationMemberStatus;
};

type CategorySeedItem = {
  id: string;
  name: string;
  mappedCategory: P.PDUCategory;
  requiredCredits: number;
};

const randomItem = <T>(items: T[]): T => faker.helpers.arrayElement(items);

const randomInt = (min: number, max: number): number =>
  faker.number.int({ min, max });

const randomFloat = (min: number, max: number, precision = 1): number =>
  Number(faker.number.float({ min, max, fractionDigits: precision }));

const daysFrom = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const utcDate = (year: number, monthIndex: number, day: number): Date =>
  new Date(Date.UTC(year, monthIndex, day));

const truncateToUtcDay = (date: Date): Date =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

const associationProfiles = [
  {
    description:
      "Professional membership body accrediting practitioners and tracking mandatory renewal compliance.",
    country: "United Kingdom",
    website: "https://cpd-institute.loopskey.dev",
  },
  {
    description:
      "Certification association overseeing continuing education for licensed members across multiple regions.",
    country: "United States",
    website: "https://renewal-board.loopskey.dev",
  },
  {
    description:
      "Industry association coordinating CPD requirements, group chapters and member renewal readiness.",
    country: "Australia",
    website: "https://chapter-network.loopskey.dev",
  },
];

const groupTemplates: Array<{
  title: string;
  description: string;
  isActive: boolean;
}> = [
  {
    title: "Northern Chapter",
    description: "Members based in the northern region.",
    isActive: true,
  },
  {
    title: "Southern Chapter",
    description: "Members based in the southern region.",
    isActive: true,
  },
  {
    title: "Senior Fellows",
    description: "Senior, long-standing accredited members.",
    isActive: true,
  },
  {
    title: "New Members Cohort",
    description: "Members who joined within the last 12 months.",
    isActive: true,
  },
  {
    title: "Legacy Chapter",
    description: "Retired chapter kept for historical records.",
    isActive: false,
  },
];

type RequirementTemplate = {
  name: string;
  description: string;
  status: P.AssociationRequirementStatus;
  audienceKind: P.AssociationAudienceKind;
  creditType: P.CreditType;
  totalRequiredCredits: number;
  reportingCycle: P.AssociationReportingCycle;
  cycleLengthYears: number | null;
  evidencePolicy: P.AssociationEvidencePolicy;
  submissionWindow: P.AssociationSubmissionWindow;
  gracePeriodDays: number;
  lateSubmissionPolicy: P.AssociationLateSubmissionPolicy;
  remindersEnabled: boolean;
  reminderTiming: P.CPDReminderTiming | null;
  reportingStart: Date | null;
  reportingEnd: Date | null;
  deadline: Date | null;
  categories: Array<{
    name: string;
    mappedCategory: P.PDUCategory;
    requiredCredits: number;
  }>;
};

const buildRequirementTemplates = (currentYear: number): RequirementTemplate[] => [
  {
    name: "Annual Ethics & Compliance CPD",
    description:
      "Mandatory annual continuing education covering ethics and regulatory compliance for every active member.",
    status: P.AssociationRequirementStatus.PUBLISHED,
    audienceKind: P.AssociationAudienceKind.ALL_MEMBERS,
    creditType: P.CreditType.CPD,
    totalRequiredCredits: 20,
    reportingCycle: P.AssociationReportingCycle.ANNUAL,
    cycleLengthYears: null,
    evidencePolicy: P.AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
    submissionWindow: P.AssociationSubmissionWindow.DAYS_90,
    gracePeriodDays: 14,
    lateSubmissionPolicy: P.AssociationLateSubmissionPolicy.ACCEPTED_FLAGGED_LATE,
    remindersEnabled: true,
    reminderTiming: P.CPDReminderTiming.DAYS_30,
    reportingStart: utcDate(currentYear, 0, 1),
    reportingEnd: utcDate(currentYear, 11, 31),
    deadline: utcDate(currentYear, 11, 31),
    categories: [
      { name: "Ethics", mappedCategory: P.PDUCategory.ETHICS, requiredCredits: 8 },
      {
        name: "Compliance & Governance",
        mappedCategory: P.PDUCategory.COMPLIANCE,
        requiredCredits: 12,
      },
    ],
  },
  {
    name: "Leadership Track for Senior Fellows",
    description:
      "Leadership development requirement targeted at the Senior Fellows chapter.",
    status: P.AssociationRequirementStatus.PUBLISHED,
    audienceKind: P.AssociationAudienceKind.GROUP,
    creditType: P.CreditType.CPD,
    totalRequiredCredits: 15,
    reportingCycle: P.AssociationReportingCycle.ONE_TIME,
    cycleLengthYears: null,
    evidencePolicy: P.AssociationEvidencePolicy.NOT_REQUIRED,
    submissionWindow: P.AssociationSubmissionWindow.WHOLE_PERIOD,
    gracePeriodDays: 0,
    lateSubmissionPolicy: P.AssociationLateSubmissionPolicy.NOT_ACCEPTED,
    remindersEnabled: false,
    reminderTiming: null,
    reportingStart: utcDate(currentYear, 0, 1),
    reportingEnd: utcDate(currentYear, 11, 31),
    deadline: utcDate(currentYear, 10, 30),
    categories: [
      {
        name: "Leadership Development",
        mappedCategory: P.PDUCategory.LEADERSHIP,
        requiredCredits: 15,
      },
    ],
  },
  {
    name: "Advanced Certification Pathway",
    description:
      "Multi-year advanced pathway assigned to a specific cohort of members preparing for senior accreditation.",
    status: P.AssociationRequirementStatus.PUBLISHED,
    audienceKind: P.AssociationAudienceKind.SPECIFIC_MEMBERS,
    creditType: P.CreditType.PDU,
    totalRequiredCredits: 30,
    reportingCycle: P.AssociationReportingCycle.MULTI_YEAR,
    cycleLengthYears: 3,
    evidencePolicy: P.AssociationEvidencePolicy.REQUIRED_NO_REVIEW,
    submissionWindow: P.AssociationSubmissionWindow.DAYS_180,
    gracePeriodDays: 30,
    lateSubmissionPolicy: P.AssociationLateSubmissionPolicy.ACCEPTED_DURING_GRACE,
    remindersEnabled: true,
    reminderTiming: P.CPDReminderTiming.DAYS_60,
    reportingStart: utcDate(currentYear - 1, 0, 1),
    reportingEnd: utcDate(currentYear + 1, 11, 31),
    deadline: utcDate(currentYear + 1, 11, 31),
    categories: [
      {
        name: "Technical Skills",
        mappedCategory: P.PDUCategory.TECHNICAL,
        requiredCredits: 20,
      },
      {
        name: "Strategic Practice",
        mappedCategory: P.PDUCategory.STRATEGIC,
        requiredCredits: 10,
      },
    ],
  },
  {
    name: "Multi-Year Renewal Requirement",
    description:
      "Two-year renewal requirement applied to every active member, mixing business and digital credit categories.",
    status: P.AssociationRequirementStatus.PUBLISHED,
    audienceKind: P.AssociationAudienceKind.ALL_MEMBERS,
    creditType: P.CreditType.CPD,
    totalRequiredCredits: 25,
    reportingCycle: P.AssociationReportingCycle.MULTI_YEAR,
    cycleLengthYears: 2,
    evidencePolicy: P.AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
    submissionWindow: P.AssociationSubmissionWindow.DAYS_60,
    gracePeriodDays: 21,
    lateSubmissionPolicy: P.AssociationLateSubmissionPolicy.ACCEPTED_FLAGGED_LATE,
    remindersEnabled: true,
    reminderTiming: P.CPDReminderTiming.DAYS_14,
    reportingStart: utcDate(currentYear - 1, 0, 1),
    reportingEnd: utcDate(currentYear, 11, 31),
    deadline: utcDate(currentYear, 11, 31),
    categories: [
      { name: "Business Skills", mappedCategory: P.PDUCategory.BUSINESS, requiredCredits: 10 },
      {
        name: "Digital & AI",
        mappedCategory: P.PDUCategory.DIGITAL_AI,
        requiredCredits: 15,
      },
    ],
  },
  {
    name: "New Member Orientation",
    description:
      "Draft orientation requirement still being configured; not yet published to members.",
    status: P.AssociationRequirementStatus.DRAFT,
    audienceKind: P.AssociationAudienceKind.ALL_MEMBERS,
    creditType: P.CreditType.CPD,
    totalRequiredCredits: 5,
    reportingCycle: P.AssociationReportingCycle.ONE_TIME,
    cycleLengthYears: null,
    evidencePolicy: P.AssociationEvidencePolicy.NOT_REQUIRED,
    submissionWindow: P.AssociationSubmissionWindow.WHOLE_PERIOD,
    gracePeriodDays: 0,
    lateSubmissionPolicy: P.AssociationLateSubmissionPolicy.NOT_ACCEPTED,
    remindersEnabled: false,
    reminderTiming: null,
    reportingStart: null,
    reportingEnd: null,
    deadline: null,
    categories: [
      {
        name: "Professional Practice",
        mappedCategory: P.PDUCategory.PROFESSIONAL_PRACTICE,
        requiredCredits: 5,
      },
    ],
  },
  {
    name: "Legacy Requirement (Superseded)",
    description: "Retired requirement kept for historical reporting only.",
    status: P.AssociationRequirementStatus.ARCHIVED,
    audienceKind: P.AssociationAudienceKind.ALL_MEMBERS,
    creditType: P.CreditType.CPD,
    totalRequiredCredits: 10,
    reportingCycle: P.AssociationReportingCycle.ANNUAL,
    cycleLengthYears: null,
    evidencePolicy: P.AssociationEvidencePolicy.NOT_REQUIRED,
    submissionWindow: P.AssociationSubmissionWindow.WHOLE_PERIOD,
    gracePeriodDays: 0,
    lateSubmissionPolicy: P.AssociationLateSubmissionPolicy.NOT_ACCEPTED,
    remindersEnabled: false,
    reminderTiming: null,
    reportingStart: utcDate(currentYear - 2, 0, 1),
    reportingEnd: utcDate(currentYear - 1, 11, 31),
    deadline: utcDate(currentYear - 1, 11, 31),
    categories: [
      {
        name: "Compliance & Governance",
        mappedCategory: P.PDUCategory.COMPLIANCE,
        requiredCredits: 10,
      },
    ],
  },
];

const seedAssociationBase = async (
  prisma: P.PrismaClient,
  owner: AssociationOwnerSeedUser,
  index: number,
) => {
  const profile = associationProfiles[index % associationProfiles.length];
  const name =
    owner.fullName && owner.fullName.trim().length > 0
      ? owner.fullName
      : `Association ${index + 1}`;

  const association = await prisma.association.upsert({
    where: { ownerId: owner.id },
    create: {
      ownerId: owner.id,
      name,
      description: profile.description,
      country: profile.country,
      website: profile.website,
      contactEmail: owner.email ?? undefined,
      logoUrl: faker.image.urlPicsumPhotos({ width: 256, height: 256, blur: 0 }),
    },
    update: {
      name,
      description: profile.description,
      country: profile.country,
      website: profile.website,
    },
    select: { id: true, ownerId: true, name: true },
  });

  const onTrackThreshold = [65, 70, 75][index % 3];
  const atRiskThreshold = [35, 40, 45][index % 3];

  await prisma.associationSettings.upsert({
    where: { associationId: association.id },
    create: {
      associationId: association.id,
      onTrackThreshold,
      atRiskThreshold,
      welcomeMessages: true,
      suppressAllEmail: false,
    },
    update: { onTrackThreshold, atRiskThreshold },
  });

  return { association, onTrackThreshold };
};

const seedAssociationGroups = async (
  prisma: P.PrismaClient,
  associationId: string,
): Promise<GroupSeedItem[]> => {
  for (const template of groupTemplates) {
    await prisma.associationGroup.upsert({
      where: { associationId_title: { associationId, title: template.title } },
      create: {
        associationId,
        title: template.title,
        description: template.description,
        isActive: template.isActive,
      },
      update: {
        description: template.description,
        isActive: template.isActive,
      },
    });
  }
  return prisma.associationGroup.findMany({
    where: { associationId },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
};

const seedAssociationMembers = async (
  prisma: P.PrismaClient,
  associationId: string,
  professionals: ProfessionalSeedUser[],
  groups: GroupSeedItem[],
  associationIndex: number,
): Promise<MemberSeedItem[]> => {
  const activeGroups = groups.filter((group) => group.title !== "Legacy Chapter");
  const membersPerAssociation = Math.min(professionals.length, randomInt(22, 34));
  const startIndex =
    professionals.length > 0
      ? (associationIndex * membersPerAssociation) % professionals.length
      : 0;
  const selected = Array.from({ length: membersPerAssociation }).map(
    (_, index) => professionals[(startIndex + index) % professionals.length],
  );

  for (let index = 0; index < selected.length; index++) {
    const professional = selected[index];
    const remainder = index % 12;
    const status =
      remainder === 0
        ? P.AssociationMemberStatus.INACTIVE
        : remainder === 1
          ? P.AssociationMemberStatus.PENDING_ACTIVATION
          : P.AssociationMemberStatus.ACTIVE;
    const joinedVia =
      remainder % 3 === 0
        ? P.AssociationMemberJoinedVia.BULK_IMPORTED
        : remainder % 3 === 1
          ? P.AssociationMemberJoinedVia.LINKED_EXISTING_ACCOUNT
          : P.AssociationMemberJoinedVia.INVITED;
    const invitedAt = daysFrom(new Date(), -randomInt(5, 420));
    const activatedAt =
      status === P.AssociationMemberStatus.ACTIVE
        ? daysFrom(invitedAt, randomInt(0, 5))
        : null;
    const deactivatedAt =
      status === P.AssociationMemberStatus.INACTIVE
        ? daysFrom(invitedAt, randomInt(10, 60))
        : null;
    const group = activeGroups.length ? randomItem(activeGroups) : null;

    await prisma.associationMember.upsert({
      where: { associationId_userId: { associationId, userId: professional.id } },
      create: {
        associationId,
        userId: professional.id,
        groupId: index % 5 === 0 ? null : (group?.id ?? null),
        // Identity-derived, not loop-position-derived: `professionals` is
        // ordered by createdAt, which ties for every user bulk-created in the
        // same createMany statement (Postgres evaluates now() once per
        // statement), so Postgres doesn't guarantee the same relative order
        // across separate seed runs. A position-based number collided with
        // an existing row's memberNumber on re-run; this can't.
        memberNumber: `AM-${professional.id.slice(-6).toUpperCase()}`,
        status,
        joinedVia,
        invitedAt,
        activatedAt,
        deactivatedAt,
        notes:
          status === P.AssociationMemberStatus.INACTIVE
            ? "Deactivated membership retained for historical reporting."
            : null,
      },
      update: {
        groupId: index % 5 === 0 ? null : (group?.id ?? null),
        status,
        joinedVia,
        activatedAt,
        deactivatedAt,
      },
    });
  }

  // Ordered by id (unique, unlike createdAt) so the "first 5 members" and
  // "eligible[i % length]" picks made from this list downstream are stable
  // across re-runs of the seed against an already-populated database.
  // Reconcile rather than only ever add: if this run's random member count or
  // window differs even slightly from a prior run's, drop membership for
  // whoever fell out of `selected` so re-running doesn't accumulate stale
  // members forever. AssociationMember cascades to
  // AssociationRequirementAssignment/AssociationCreditAttribution/
  // AssociationRequirementTarget/AssociationMessageDelivery, so this cleans
  // up the whole downstream chain too.
  await prisma.associationMember.deleteMany({
    where: {
      associationId,
      userId: { notIn: selected.map((professional) => professional.id) },
    },
  });

  return prisma.associationMember.findMany({
    where: { associationId },
    select: { id: true, userId: true, groupId: true, status: true },
    orderBy: { id: "asc" },
  });
};

const resolveCoveredMembers = (
  members: MemberSeedItem[],
  audienceKind: P.AssociationAudienceKind,
  groupId: string | null,
  memberIds: string[],
): MemberSeedItem[] => {
  const eligible = members.filter(
    (member) => member.status !== P.AssociationMemberStatus.INACTIVE,
  );
  if (audienceKind === P.AssociationAudienceKind.ALL_MEMBERS) return eligible;
  if (audienceKind === P.AssociationAudienceKind.GROUP)
    return eligible.filter((member) => member.groupId === groupId);
  return eligible.filter((member) => memberIds.includes(member.id));
};

const fallbackCategoryFor = (used: P.PDUCategory[]): P.PDUCategory => {
  const pool = Object.values(P.PDUCategory).filter((c) => !used.includes(c));
  return pool.length ? randomItem(pool) : P.PDUCategory.OTHER;
};

type Tier = "renewal_ready" | "on_track" | "at_risk" | "not_started";

const tierFor = (memberOrdinal: number): Tier => {
  const remainder = memberOrdinal % 4;
  if (remainder === 0) return "renewal_ready";
  if (remainder === 1) return "on_track";
  if (remainder === 2) return "at_risk";
  return "not_started";
};

const buildMemberActivityInputs = (
  tier: Tier,
  requirement: RequirementTemplate,
  windowFrom: Date,
  windowTo: Date,
  wantsAwaitingReview: boolean,
): Array<{
  category: P.PDUCategory;
  pdus: number;
  status: P.PDUStatus;
  hasEvidence: boolean;
  date: Date;
}> => {
  const inputs: Array<{
    category: P.PDUCategory;
    pdus: number;
    status: P.PDUStatus;
    hasEvidence: boolean;
    date: Date;
  }> = [];
  const needsEvidence =
    requirement.evidencePolicy !== P.AssociationEvidencePolicy.NOT_REQUIRED;
  const withinWindowDate = () => {
    const span = Math.max(windowTo.getTime() - windowFrom.getTime(), 1);
    return new Date(windowFrom.getTime() + faker.number.float() * span * 0.85);
  };

  if (tier === "renewal_ready") {
    for (const category of requirement.categories) {
      inputs.push({
        category: category.mappedCategory,
        pdus: category.requiredCredits,
        status: P.PDUStatus.APPROVED,
        hasEvidence: needsEvidence,
        date: withinWindowDate(),
      });
    }
    inputs.push({
      category: fallbackCategoryFor(
        requirement.categories.map((c) => c.mappedCategory),
      ),
      pdus: randomFloat(1, 3),
      status: P.PDUStatus.APPROVED,
      hasEvidence: needsEvidence,
      date: withinWindowDate(),
    });
  } else if (tier === "on_track") {
    for (const category of requirement.categories) {
      inputs.push({
        category: category.mappedCategory,
        pdus: Number((category.requiredCredits * randomFloat(0.55, 0.85)).toFixed(1)),
        status: P.PDUStatus.APPROVED,
        hasEvidence: needsEvidence,
        date: withinWindowDate(),
      });
    }
    if (
      requirement.lateSubmissionPolicy !== P.AssociationLateSubmissionPolicy.NOT_ACCEPTED &&
      faker.number.float() < 0.2
    ) {
      inputs.push({
        category: requirement.categories[0].mappedCategory,
        pdus: randomFloat(1, 2),
        status: P.PDUStatus.APPROVED,
        hasEvidence: needsEvidence,
        date: daysFrom(windowTo, randomInt(1, 5)),
      });
    }
  } else if (tier === "at_risk") {
    const first = requirement.categories[0];
    inputs.push({
      category: first.mappedCategory,
      pdus: Number((first.requiredCredits * randomFloat(0.15, 0.35)).toFixed(1)),
      status: P.PDUStatus.APPROVED,
      hasEvidence: needsEvidence,
      date: withinWindowDate(),
    });
    if (faker.number.float() < 0.4) {
      inputs.push({
        category: fallbackCategoryFor(
          requirement.categories.map((c) => c.mappedCategory),
        ),
        pdus: randomFloat(0.5, 2),
        status: P.PDUStatus.REJECTED,
        hasEvidence: false,
        date: withinWindowDate(),
      });
    }
  }

  if (wantsAwaitingReview) {
    inputs.push({
      category: requirement.categories[0].mappedCategory,
      pdus: randomFloat(2, 5),
      status: P.PDUStatus.PENDING,
      hasEvidence: true,
      date: withinWindowDate(),
    });
  }

  return inputs;
};

const seedRequirementCompliance = async (
  prisma: P.PrismaClient,
  associationId: string,
  requirementId: string,
  template: RequirementTemplate,
  categories: CategorySeedItem[],
  covered: MemberSeedItem[],
  onTrackThreshold: number,
) => {
  const cycleStart = truncateToUtcDay(
    template.reportingStart ?? new Date(),
  );
  const attributionRequirement: AttributionRequirement = {
    deadline: template.deadline,
    creditType: template.creditType,
    gracePeriodDays: template.gracePeriodDays,
    reportingEnd: template.reportingEnd,
    reportingStart: template.reportingStart,
    evidencePolicy: template.evidencePolicy,
    lateSubmissionPolicy: template.lateSubmissionPolicy,
    categories: categories.map((c) => ({ id: c.id, mappedCategory: c.mappedCategory })),
  };
  const windowFrom = template.reportingStart ?? new Date();
  const windowTo = template.reportingEnd ?? template.deadline ?? new Date();

  const memberUserIds = covered.map((m) => m.userId);
  await prisma.pDUActivity.deleteMany({
    where: {
      userId: { in: memberUserIds },
      description: { contains: `${ASSOCIATION_FAKE_PREFIX}:${requirementId}` },
    },
  });

  for (let ordinal = 0; ordinal < covered.length; ordinal++) {
    const member = covered[ordinal];
    const tier = tierFor(ordinal);
    const wantsAwaitingReview =
      template.evidencePolicy === P.AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW &&
      ordinal % 5 === 0;

    const assignment = await prisma.associationRequirementAssignment.upsert({
      where: {
        requirementId_memberId_cycleStart: {
          requirementId,
          memberId: member.id,
          cycleStart,
        },
      },
      create: {
        requirementId,
        memberId: member.id,
        cycleStart,
        dueDate: template.deadline,
        isTargeted: true,
      },
      update: { isTargeted: true, dueDate: template.deadline },
      select: { id: true },
    });

    const activityInputs = buildMemberActivityInputs(
      tier,
      template,
      windowFrom,
      windowTo,
      wantsAwaitingReview,
    );

    const activities: AttributionActivity[] = [];
    for (let i = 0; i < activityInputs.length; i++) {
      const input = activityInputs[i];
      const created = await prisma.pDUActivity.create({
        data: {
          userId: member.userId,
          title: `${template.name} — supporting activity ${i + 1}`,
          description: `${ASSOCIATION_FAKE_PREFIX}:${requirementId}: Auto-generated compliance activity for association dashboard testing.`,
          source: P.PDUSource.SELF_STUDY,
          category: input.category,
          status: input.status,
          pdus: input.pdus,
          date: input.date,
          creditType: template.creditType,
          completionStatus: P.PDUCompletionStatus.COMPLETED,
          reportingYear: input.date.getUTCFullYear(),
          providerOrganizer: "LoopsKey Academy",
          evidenceUrl: input.hasEvidence
            ? `https://loopskey.local/evidence/${member.userId}-${requirementId}-${i + 1}.pdf`
            : null,
        },
        select: { id: true },
      });
      activities.push({
        id: created.id,
        date: input.date,
        status: input.status,
        credits: input.pdus,
        category: input.category,
        creditType: template.creditType,
        hasEvidence: input.hasEvidence,
      });
    }

    const attributions: Attribution[] = [];
    for (const activity of activities) {
      const attribution = attributionFor(activity, attributionRequirement, {
        cycleStart,
        cycleEnd: null,
      });
      if (attribution) attributions.push(attribution);
    }

    for (const attribution of attributions) {
      await prisma.associationCreditAttribution.upsert({
        where: {
          assignmentId_activityId: {
            assignmentId: assignment.id,
            activityId: attribution.activityId,
          },
        },
        create: {
          assignmentId: assignment.id,
          activityId: attribution.activityId,
          categoryId: attribution.categoryId,
          creditedAmount: attribution.creditedAmount,
          activityDate: attribution.activityDate,
          isLate: attribution.isLate,
          state: attribution.state,
        },
        update: {
          categoryId: attribution.categoryId,
          creditedAmount: attribution.creditedAmount,
          isLate: attribution.isLate,
          state: attribution.state,
        },
      });
    }

    const totals = totalsFor(attributions, template.totalRequiredCredits);
    const band = bandFor({
      percent: totals.percent,
      awaitingReviewCount: totals.awaitingReviewCount,
      onTrackThreshold,
    });

    await prisma.associationRequirementAssignment.update({
      where: { id: assignment.id },
      data: {
        recordedCredits: totals.completedCredits,
        completedCredits: totals.completedCredits,
        percent: totals.percent,
        band,
        awaitingReviewCount: totals.awaitingReviewCount,
        isMissingEvidence: totals.isMissingEvidence,
        computedAt: new Date(),
      },
    });
  }
};

const seedAssociationRequirements = async (
  prisma: P.PrismaClient,
  associationId: string,
  ownerId: string,
  members: MemberSeedItem[],
  groups: GroupSeedItem[],
  onTrackThreshold: number,
  currentYear: number,
) => {
  const templates = buildRequirementTemplates(currentYear);
  const seniorFellows = groups.find((g) => g.title === "Senior Fellows") ?? null;
  const specificMemberIds = members.slice(0, 5).map((m) => m.id);

  for (const template of templates) {
    const existing = await prisma.associationRequirement.findFirst({
      where: { associationId, name: template.name },
      select: { id: true },
    });

    const data = {
      associationId,
      createdById: ownerId,
      name: template.name,
      description: template.description,
      creditType: template.creditType,
      totalRequiredCredits: template.totalRequiredCredits,
      deadline: template.deadline,
      reportingCycle: template.reportingCycle,
      cycleLengthYears: template.cycleLengthYears,
      evidencePolicy: template.evidencePolicy,
      reportingStart: template.reportingStart,
      reportingEnd: template.reportingEnd,
      submissionWindow: template.submissionWindow,
      gracePeriodDays: template.gracePeriodDays,
      lateSubmissionPolicy: template.lateSubmissionPolicy,
      audienceKind: template.audienceKind,
      remindersEnabled: template.remindersEnabled,
      reminderTiming: template.reminderTiming,
      status: template.status,
      publishedAt:
        template.status === P.AssociationRequirementStatus.PUBLISHED ? new Date() : null,
      archivedAt:
        template.status === P.AssociationRequirementStatus.ARCHIVED ? new Date() : null,
    };

    const requirement = existing
      ? await prisma.associationRequirement.update({
          where: { id: existing.id },
          data,
          select: { id: true },
        })
      : await prisma.associationRequirement.create({
          data,
          select: { id: true },
        });

    const categories: CategorySeedItem[] = [];
    for (const [order, category] of template.categories.entries()) {
      const saved = await prisma.associationRequirementCategory.upsert({
        where: {
          requirementId_name: { requirementId: requirement.id, name: category.name },
        },
        create: {
          requirementId: requirement.id,
          name: category.name,
          mappedCategory: category.mappedCategory,
          requiredCredits: category.requiredCredits,
          order,
        },
        update: {
          mappedCategory: category.mappedCategory,
          requiredCredits: category.requiredCredits,
          order,
        },
        select: { id: true, name: true, mappedCategory: true, requiredCredits: true },
      });
      categories.push(saved);
    }

    let targetGroupId: string | null = null;
    if (template.audienceKind === P.AssociationAudienceKind.GROUP && seniorFellows) {
      targetGroupId = seniorFellows.id;
      const existingTarget = await prisma.associationRequirementTarget.findFirst({
        where: { requirementId: requirement.id, groupId: targetGroupId },
        select: { id: true },
      });
      if (!existingTarget)
        await prisma.associationRequirementTarget.create({
          data: {
            requirementId: requirement.id,
            kind: P.AssociationAudienceKind.GROUP,
            groupId: targetGroupId,
          },
        });
    }

    if (template.audienceKind === P.AssociationAudienceKind.SPECIFIC_MEMBERS) {
      for (const memberId of specificMemberIds) {
        const existingTarget = await prisma.associationRequirementTarget.findFirst({
          where: { requirementId: requirement.id, memberId },
          select: { id: true },
        });
        if (!existingTarget)
          await prisma.associationRequirementTarget.create({
            data: {
              requirementId: requirement.id,
              kind: P.AssociationAudienceKind.SPECIFIC_MEMBERS,
              memberId,
            },
          });
      }
    }

    if (template.status !== P.AssociationRequirementStatus.PUBLISHED) continue;

    const covered = resolveCoveredMembers(
      members,
      template.audienceKind,
      targetGroupId,
      specificMemberIds,
    );
    if (!covered.length) continue;

    await seedRequirementCompliance(
      prisma,
      associationId,
      requirement.id,
      template,
      categories,
      covered,
      onTrackThreshold,
    );
  }
};

const learningContentTemplates: Array<{
  externalTitle: string;
  externalProvider: string;
  externalUrl: string;
  description: string;
  category: P.PDUCategory;
  indicativeCredits: number;
  status: P.AssociationLearningContentStatus;
  audienceKind: P.AssociationAudienceKind;
}> = [
  {
    externalTitle: "Ethics in Professional Practice",
    externalProvider: "LoopsKey Academy",
    externalUrl: "https://loopskey.local/learning/ethics-professional-practice",
    description: "A recommended module covering ethical decision-making case studies.",
    category: P.PDUCategory.ETHICS,
    indicativeCredits: 3,
    status: P.AssociationLearningContentStatus.PUBLISHED,
    audienceKind: P.AssociationAudienceKind.ALL_MEMBERS,
  },
  {
    externalTitle: "Compliance Governance Refresher",
    externalProvider: "Global CPD Institute",
    externalUrl: "https://loopskey.local/learning/compliance-governance-refresher",
    description: "Governance and compliance refresher aligned with the annual requirement.",
    category: P.PDUCategory.COMPLIANCE,
    indicativeCredits: 4,
    status: P.AssociationLearningContentStatus.PUBLISHED,
    audienceKind: P.AssociationAudienceKind.ALL_MEMBERS,
  },
  {
    externalTitle: "Leadership for Senior Fellows",
    externalProvider: "LoopsKey Academy",
    externalUrl: "https://loopskey.local/learning/leadership-senior-fellows",
    description: "Leadership content curated for the Senior Fellows chapter.",
    category: P.PDUCategory.LEADERSHIP,
    indicativeCredits: 5,
    status: P.AssociationLearningContentStatus.PUBLISHED,
    audienceKind: P.AssociationAudienceKind.GROUP,
  },
  {
    externalTitle: "Digital Transformation Essentials (Draft)",
    externalProvider: "Digital Skills Academy",
    externalUrl: "https://loopskey.local/learning/digital-transformation-essentials",
    description: "Draft content still under internal review before publishing.",
    category: P.PDUCategory.DIGITAL_AI,
    indicativeCredits: 6,
    status: P.AssociationLearningContentStatus.DRAFT,
    audienceKind: P.AssociationAudienceKind.ALL_MEMBERS,
  },
  {
    externalTitle: "Legacy Strategic Practice Series",
    externalProvider: "International CPD Hub",
    externalUrl: "https://loopskey.local/learning/legacy-strategic-practice",
    description: "Withdrawn series kept for historical reference.",
    category: P.PDUCategory.STRATEGIC,
    indicativeCredits: 4,
    status: P.AssociationLearningContentStatus.WITHDRAWN,
    audienceKind: P.AssociationAudienceKind.ALL_MEMBERS,
  },
];

const seedAssociationLearningContent = async (
  prisma: P.PrismaClient,
  associationId: string,
  ownerId: string,
  groups: GroupSeedItem[],
) => {
  const seniorFellows = groups.find((g) => g.title === "Senior Fellows") ?? null;

  for (const template of learningContentTemplates) {
    const existing = await prisma.associationLearningContent.findFirst({
      where: { associationId, externalTitle: template.externalTitle },
      select: { id: true },
    });

    const data = {
      associationId,
      createdById: ownerId,
      externalTitle: template.externalTitle,
      externalProvider: template.externalProvider,
      externalUrl: template.externalUrl,
      description: template.description,
      category: template.category,
      indicativeCredits: template.indicativeCredits,
      status: template.status,
      publishedAt:
        template.status === P.AssociationLearningContentStatus.PUBLISHED ? new Date() : null,
      withdrawnAt:
        template.status === P.AssociationLearningContentStatus.WITHDRAWN ? new Date() : null,
      audienceKind: template.audienceKind,
    };

    const content = existing
      ? await prisma.associationLearningContent.update({
          where: { id: existing.id },
          data,
          select: { id: true },
        })
      : await prisma.associationLearningContent.create({
          data,
          select: { id: true },
        });

    if (template.audienceKind === P.AssociationAudienceKind.GROUP && seniorFellows) {
      const existingTarget = await prisma.associationLearningContentTarget.findFirst({
        where: { learningContentId: content.id, groupId: seniorFellows.id },
        select: { id: true },
      });
      if (!existingTarget)
        await prisma.associationLearningContentTarget.create({
          data: {
            learningContentId: content.id,
            kind: P.AssociationAudienceKind.GROUP,
            groupId: seniorFellows.id,
          },
        });
    }
  }
};

const buildPlaceholderPdf = async (title: string): Promise<Buffer> => {
  return new Promise((resolvePromise, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolvePromise(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.fontSize(18).text(title, { align: "left" });
    doc.moveDown();
    doc
      .fontSize(11)
      .text(
        "Seed-generated report for local/demo testing. Replace with a real export once the report generation pipeline runs.",
      );
    doc.end();
  });
};

const buildPlaceholderExcel = async (title: string): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report");
  sheet.addRow([title]);
  sheet.addRow([]);
  sheet.addRow(["Member", "Requirement", "Percent Complete", "Band"]);
  sheet.addRow(["Seed Member A", "Annual Ethics & Compliance CPD", 92, "RENEWAL_READY"]);
  sheet.addRow(["Seed Member B", "Annual Ethics & Compliance CPD", 58, "AT_RISK"]);
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

const reportTemplates: Array<{
  reportType: P.AssociationReportType;
  format: P.AssociationReportFormat;
  state: P.AssociationGeneratedReportState;
}> = [
  {
    reportType: P.AssociationReportType.OVERVIEW_SUMMARY,
    format: P.AssociationReportFormat.PDF,
    state: P.AssociationGeneratedReportState.READY,
  },
  {
    reportType: P.AssociationReportType.CATEGORY_COMPLETION,
    format: P.AssociationReportFormat.EXCEL,
    state: P.AssociationGeneratedReportState.READY,
  },
  {
    reportType: P.AssociationReportType.RENEWAL_READINESS,
    format: P.AssociationReportFormat.PDF,
    state: P.AssociationGeneratedReportState.PENDING,
  },
  {
    reportType: P.AssociationReportType.MEMBER_PROGRESS,
    format: P.AssociationReportFormat.EXCEL,
    state: P.AssociationGeneratedReportState.FAILED,
  },
  {
    reportType: P.AssociationReportType.GROUP_PROGRESS,
    format: P.AssociationReportFormat.PDF,
    state: P.AssociationGeneratedReportState.EXPIRED,
  },
  {
    reportType: P.AssociationReportType.MISSING_EVIDENCE,
    format: P.AssociationReportFormat.EXCEL,
    state: P.AssociationGeneratedReportState.READY,
  },
];

// Mirrors LocalObjectStorageAdapter's "report" namespace root, duplicated
// (rather than imported from src/infrastructure/storage) for the same
// deploy-portability reason as the compliance attribution functions above.
const storeReportFile = async (key: string, data: Buffer) => {
  const root = resolve(
    process.env.REPORT_STORAGE_DIR ?? join(process.cwd(), "uploads", "reports"),
  );
  await mkdir(root, { recursive: true });
  await writeFile(resolve(join(root, key)), data);
};

const seedAssociationReports = async (
  prisma: P.PrismaClient,
  associationId: string,
  ownerId: string,
) => {
  for (const template of reportTemplates) {
    const existing = await prisma.associationGeneratedReport.findFirst({
      where: { associationId, reportType: template.reportType, format: template.format },
      select: { id: true },
    });
    const isPdf = template.format === P.AssociationReportFormat.PDF;
    const extension = isPdf ? "pdf" : "xlsx";
    const id = existing?.id ?? faker.string.alphanumeric(20);
    // Flat key, matching the real generator (association-report-export.util.ts's
    // exportStorageKey) — LocalObjectStorageAdapter only mkdirs its namespace
    // root, not arbitrary subfolders, so a nested key fails to write.
    const storageKey = `${id}.${extension}`;
    const fileName = `${template.reportType.toLowerCase()}-${id.slice(-6)}.${extension}`;
    const mimeType = isPdf
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    const data = {
      associationId,
      requestedById: ownerId,
      reportType: template.reportType,
      format: template.format,
      filter: {},
      filterHash: faker.string.alphanumeric(16),
      locale: "en",
      state: template.state,
      storageKey,
      fileName,
      mimeType,
      sizeBytes: null,
      rowCount: template.state === P.AssociationGeneratedReportState.READY ? randomInt(10, 200) : null,
      failureReason:
        template.state === P.AssociationGeneratedReportState.FAILED
          ? "Seed-generated failure state for UI testing."
          : null,
      readyAt: template.state === P.AssociationGeneratedReportState.READY ? new Date() : null,
      expiresAt:
        template.state === P.AssociationGeneratedReportState.EXPIRED
          ? daysFrom(new Date(), -1)
          : template.state === P.AssociationGeneratedReportState.READY
            ? daysFrom(new Date(), 7)
            : null,
    };

    if (existing) {
      await prisma.associationGeneratedReport.update({ where: { id: existing.id }, data });
    } else {
      await prisma.associationGeneratedReport.create({ data: { ...data, id } });
    }

    if (template.state === P.AssociationGeneratedReportState.READY) {
      const buffer = isPdf
        ? await buildPlaceholderPdf(`${template.reportType.replace(/_/g, " ")} Report`)
        : await buildPlaceholderExcel(`${template.reportType.replace(/_/g, " ")} Report`);
      await storeReportFile(storageKey, buffer);
    }
  }
};

const messageTemplates: Array<{
  messageType: P.AssociationMessageType;
  state: P.AssociationMessageDeliveryState;
}> = [
  {
    messageType: P.AssociationMessageType.WELCOME,
    state: P.AssociationMessageDeliveryState.SENT,
  },
  {
    messageType: P.AssociationMessageType.BEHIND_THRESHOLD,
    state: P.AssociationMessageDeliveryState.SENT,
  },
  {
    messageType: P.AssociationMessageType.CATEGORY_BEHIND,
    state: P.AssociationMessageDeliveryState.QUEUED,
  },
  {
    messageType: P.AssociationMessageType.CERTIFICATE_EXPIRING,
    state: P.AssociationMessageDeliveryState.SENT,
  },
  {
    messageType: P.AssociationMessageType.BEHIND_THRESHOLD,
    state: P.AssociationMessageDeliveryState.FAILED,
  },
  {
    messageType: P.AssociationMessageType.WELCOME,
    state: P.AssociationMessageDeliveryState.SKIPPED,
  },
];

const seedAssociationMessages = async (
  prisma: P.PrismaClient,
  associationId: string,
  members: MemberSeedItem[],
) => {
  const eligible = members.filter(
    (m) => m.status !== P.AssociationMemberStatus.INACTIVE,
  );
  if (!eligible.length) return;

  for (let i = 0; i < messageTemplates.length; i++) {
    const template = messageTemplates[i];
    const member = eligible[i % eligible.length];
    const cooldownBucket = i;

    await prisma.associationMessageDelivery.upsert({
      where: {
        associationId_memberId_messageType_cooldownBucket: {
          associationId,
          memberId: member.id,
          messageType: template.messageType,
          cooldownBucket,
        },
      },
      create: {
        associationId,
        memberId: member.id,
        recipientUserId: member.userId,
        messageType: template.messageType,
        templateVersion: 1,
        audience: { kind: "MEMBER", memberId: member.id },
        context: { seeded: true },
        language: P.AppLanguage.EN,
        cooldownBucket,
        state: template.state,
        skipReason:
          template.state === P.AssociationMessageDeliveryState.SKIPPED
            ? "Member opted out of non-essential notifications."
            : null,
        failureReason:
          template.state === P.AssociationMessageDeliveryState.FAILED
            ? "Seed-generated delivery failure for UI testing."
            : null,
        sentAt:
          template.state === P.AssociationMessageDeliveryState.SENT ? new Date() : null,
      },
      update: { state: template.state },
    });
  }
};

export const seedAssociationDashboard = async (
  prisma: P.PrismaClient,
): Promise<void> => {
  const currentYear = new Date().getFullYear();

  // Ordered by id, not createdAt: every user bulk-created in the same
  // users-seed.ts createMany() call shares one createdAt (Postgres evaluates
  // now() once per statement), so createdAt ties make Postgres's tie-break
  // order unstable across separate seed runs — which round-robin position
  // (and downstream memberNumber/status/group assignment) depended on.
  const owners = await prisma.user.findMany({
    where: { role: P.Role.ASSOCIATION, status: P.UserStatus.ACTIVE, deletedAt: null },
    select: { id: true, email: true, fullName: true },
    orderBy: { id: "asc" },
  });

  if (!owners.length) {
    console.log("⚠️ No ASSOCIATION users found. Association seed skipped.");
    return;
  }

  const professionals = await prisma.user.findMany({
    where: { role: P.Role.PROFESSIONAL, status: P.UserStatus.ACTIVE, deletedAt: null },
    select: { id: true, email: true, fullName: true },
    orderBy: { id: "asc" },
  });

  if (!professionals.length) {
    console.log("⚠️ No PROFESSIONAL users found. Association members skipped.");
    return;
  }

  for (let index = 0; index < owners.length; index++) {
    const owner = owners[index];
    const { association, onTrackThreshold } = await seedAssociationBase(
      prisma,
      owner,
      index,
    );
    const groups = await seedAssociationGroups(prisma, association.id);
    const members = await seedAssociationMembers(
      prisma,
      association.id,
      professionals,
      groups,
      index,
    );
    await seedAssociationRequirements(
      prisma,
      association.id,
      owner.id,
      members,
      groups,
      onTrackThreshold,
      currentYear,
    );
    await seedAssociationLearningContent(prisma, association.id, owner.id, groups);
    await seedAssociationReports(prisma, association.id, owner.id);
    await seedAssociationMessages(prisma, association.id, members);
  }
};
