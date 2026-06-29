import { faker } from "@faker-js/faker";

import * as P from "@prisma/client";

type OrganizationOwnerSeedUser = {
  id: string;
  createdAt: Date;
  email: string | null;
  fullName: string | null;
};

type ProfessionalSeedUser = {
  id: string;
  email: string | null;
  fullName: string | null;
};

type DepartmentSeedItem = {
  id: string;
  title: string;
};

type OrganizationMemberSeedItem = {
  id: string;
  userId: string;
  jobRole: string | null;
  departmentId: string | null;
};

type LearningContentSeedItem = {
  id: string;
  title: string;
};

const organizationProfiles = [
  {
    name: "LoopsKey Enterprise Learning",
    industry: "Technology",
    country: "Germany",
    website: "https://enterprise.loopskey.dev",
    description:
      "Enterprise learning organization focused on CPD, compliance, leadership and professional growth.",
  },
  {
    name: "Global Healthcare CPD Group",
    industry: "Healthcare",
    country: "Canada",
    website: "https://health-cpd.loopskey.dev",
    description:
      "Healthcare organization managing professional development and compliance for licensed specialists.",
  },
  {
    name: "Future Skills Organization",
    industry: "Education",
    country: "France",
    website: "https://future-skills.loopskey.dev",
    description:
      "Learning-focused organization supporting employees with structured CPD assignments and reporting.",
  },
  {
    name: "Strategic Compliance Network",
    industry: "Finance",
    country: "United Arab Emirates",
    website: "https://compliance-network.loopskey.dev",
    description:
      "Compliance-driven organization tracking mandatory learning, CPD progress and member performance.",
  },
];

const departmentTemplates = [
  {
    title: "Engineering",
    description: "Software, platform and technical delivery team.",
  },
  {
    title: "Product",
    description: "Product management, discovery and roadmap ownership.",
  },
  {
    title: "Compliance",
    description: "Regulatory compliance, governance and audit readiness.",
  },
  {
    title: "Operations",
    description:
      "Operational excellence, process improvement and service delivery.",
  },
  {
    title: "Leadership",
    description: "Managers, team leads and strategic decision makers.",
  },
  {
    title: "Learning & Development",
    description: "Training coordination, CPD planning and internal enablement.",
  },
];

const cpdCategoryTemplates: Array<{
  title: string;
  description: string;
  requiredHours: number;
  category: P.PDUCategory;
}> = [
  {
    category: P.PDUCategory.TECHNICAL,
    title: "Technical Skills",
    description:
      "Technical training, platform knowledge and specialist skills.",
    requiredHours: 16,
  },
  {
    category: P.PDUCategory.LEADERSHIP,
    title: "Leadership Development",
    description: "Management, mentoring, coaching and leadership capability.",
    requiredHours: 10,
  },
  {
    category: P.PDUCategory.COMPLIANCE,
    title: "Compliance & Governance",
    description: "Mandatory compliance, governance and regulatory learning.",
    requiredHours: 12,
  },
  {
    category: P.PDUCategory.BUSINESS,
    title: "Business Skills",
    description: "Business strategy, communication and commercial skills.",
    requiredHours: 8,
  },
  {
    category: P.PDUCategory.ETHICS,
    title: "Ethics",
    description: "Ethical decision making and professional responsibility.",
    requiredHours: 6,
  },
  {
    category: P.PDUCategory.STRATEGIC,
    title: "Strategic Practice",
    description:
      "Strategic planning, transformation and organizational growth.",
    requiredHours: 8,
  },
];

const jobRoles = [
  "Team Lead",
  "Data Analyst",
  "Project Manager",
  "Operations Lead",
  "Training Manager",
  "Business Analyst",
  "Software Engineer",
  "Learning Coordinator",
  "Compliance Specialist",
  "Senior Product Manager",
];

const randomItem = <TItem>(items: TItem[]): TItem =>
  items[Math.floor(Math.random() * items.length)];

const randomInt = (min: number, max: number): number =>
  faker.number.int({ min, max });

const randomFloat = (min: number, max: number, precision = 2): number => {
  return Number(
    faker.number.float({
      min,
      max,
      fractionDigits: precision,
    }),
  );
};

const randomPastDate = (days = 240): Date => faker.date.recent({ days });

const randomFutureDate = (days = 120): Date => faker.date.soon({ days });

const getComplianceFromPdus = (pdus: number, minimumPdu: number): number => {
  if (minimumPdu <= 0) return 0;
  return Number(Math.min((pdus / minimumPdu) * 100, 100).toFixed(2));
};

const getOrganizationDisplayName = (
  owner: OrganizationOwnerSeedUser,
  index: number,
): string => {
  const profile = organizationProfiles[index % organizationProfiles.length];
  return owner.fullName && owner.fullName.trim().length > 0
    ? owner.fullName
    : profile.name;
};

const seedOrganizationBase = async (
  prisma: P.PrismaClient,
  owner: OrganizationOwnerSeedUser,
  index: number,
) => {
  const profile = organizationProfiles[index % organizationProfiles.length];
  const name = getOrganizationDisplayName(owner, index);
  const organization = await prisma.organization.upsert({
    where: {
      ownerId: owner.id,
    },
    create: {
      ownerId: owner.id,
      name,
      logoUrl: faker.image.urlPicsumPhotos({
        width: 256,
        height: 256,
        blur: 0,
      }),
      description: profile.description,
      country: profile.country,
      industry: profile.industry,
      website: profile.website,
    },
    update: {
      name,
      description: profile.description,
      country: profile.country,
      industry: profile.industry,
      website: profile.website,
    },
    select: {
      id: true,
      ownerId: true,
      name: true,
    },
  });
  const minimumPdu = randomItem([40, 50, 60, 70, 80]);
  const complianceCycle = randomItem([
    P.ComplianceCycle.ANNUAL,
    P.ComplianceCycle.BIANNUAL,
    P.ComplianceCycle.QUARTERLY,
  ]);
  await prisma.organizationSettings.upsert({
    where: {
      organizationId: organization.id,
    },
    create: {
      organizationId: organization.id,
      complianceCycle,
      minimumPdu,
      strictCompliance: randomItem([true, false, false]),
      complianceAlerts: true,
      assignmentNotifications: true,
      weeklySummaryReport: true,
    },
    update: {
      complianceCycle,
      minimumPdu,
      strictCompliance: randomItem([true, false, false]),
      complianceAlerts: true,
      assignmentNotifications: true,
      weeklySummaryReport: true,
    },
  });
  return {
    organization,
    minimumPdu,
  };
};

const seedOrganizationDepartments = async (
  prisma: P.PrismaClient,
  organizationId: string,
): Promise<DepartmentSeedItem[]> => {
  for (const department of departmentTemplates) {
    await prisma.organizationDepartment.upsert({
      where: {
        organizationId_title: {
          organizationId,
          title: department.title,
        },
      },
      create: {
        organizationId,
        title: department.title,
        description: department.description,
        isActive: true,
      },
      update: {
        description: department.description,
        isActive: true,
      },
    });
  }
  await prisma.organizationDepartment.upsert({
    where: {
      organizationId_title: {
        organizationId,
        title: "Archived Department",
      },
    },
    create: {
      organizationId,
      title: "Archived Department",
      description:
        "Inactive department for testing archived department UI state.",
      isActive: false,
    },
    update: {
      description:
        "Inactive department for testing archived department UI state.",
      isActive: false,
    },
  });
  return prisma.organizationDepartment.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: "asc",
    },
  });
};

const seedOrganizationCpdCategories = async (
  prisma: P.PrismaClient,
  organizationId: string,
) => {
  for (const item of cpdCategoryTemplates) {
    await prisma.organizationCPDCategory.upsert({
      where: {
        organizationId_category: {
          organizationId,
          category: item.category,
        },
      },
      create: {
        organizationId,
        category: item.category,
        title: item.title,
        description: item.description,
        requiredHours: item.requiredHours,
        isActive: true,
      },
      update: {
        title: item.title,
        description: item.description,
        requiredHours: item.requiredHours,
        isActive: true,
      },
    });
  }

  await prisma.organizationCPDCategory.upsert({
    where: {
      organizationId_category: {
        organizationId,
        category: P.PDUCategory.OTHER,
      },
    },
    create: {
      organizationId,
      category: P.PDUCategory.OTHER,
      title: "Other Learning",
      description:
        "Optional learning category used for non-standard CPD activities.",
      requiredHours: 4,
      isActive: false,
    },
    update: {
      title: "Other Learning",
      description:
        "Optional learning category used for non-standard CPD activities.",
      requiredHours: 4,
      isActive: false,
    },
  });
};

const seedOrganizationMembers = async (
  prisma: P.PrismaClient,
  organizationId: string,
  professionals: ProfessionalSeedUser[],
  departments: DepartmentSeedItem[],
  minimumPdu: number,
  organizationIndex: number,
): Promise<OrganizationMemberSeedItem[]> => {
  const membersPerOrganization = Math.min(
    professionals.length,
    randomInt(18, 32),
  );
  const startIndex =
    professionals.length > 0
      ? (organizationIndex * membersPerOrganization) % professionals.length
      : 0;
  const selectedProfessionals = Array.from({
    length: membersPerOrganization,
  }).map((_, index) => {
    return professionals[(startIndex + index) % professionals.length];
  });
  for (let index = 0; index < selectedProfessionals.length; index++) {
    const professional = selectedProfessionals[index];
    const department = randomItem(departments);
    const status =
      index % 9 === 0
        ? P.OrganizationMemberStatus.INACTIVE
        : P.OrganizationMemberStatus.ACTIVE;

    const pdus =
      status === P.OrganizationMemberStatus.INACTIVE
        ? randomFloat(0, minimumPdu * 0.5)
        : randomFloat(5, minimumPdu * 1.25);
    const compliance =
      status === P.OrganizationMemberStatus.INACTIVE
        ? randomFloat(10, 55)
        : getComplianceFromPdus(pdus, minimumPdu);

    const completedLearning =
      status === P.OrganizationMemberStatus.INACTIVE
        ? randomInt(0, 3)
        : randomInt(1, 18);

    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId,
          userId: professional.id,
        },
      },
      create: {
        organizationId,
        userId: professional.id,
        departmentId: department.id,
        jobRole: randomItem(jobRoles),
        status,
        completedLearning,
        pdus,
        compliance,
        joinedAt: randomPastDate(420),
        deactivatedAt:
          status === P.OrganizationMemberStatus.INACTIVE
            ? randomPastDate(60)
            : null,
        notes:
          compliance < 70
            ? "Needs follow-up on mandatory CPD progress."
            : "Good learning progress.",
      },
      update: {
        departmentId: department.id,
        jobRole: randomItem(jobRoles),
        status,
        completedLearning,
        pdus,
        compliance,
        deactivatedAt:
          status === P.OrganizationMemberStatus.INACTIVE
            ? randomPastDate(60)
            : null,
        notes:
          compliance < 70
            ? "Needs follow-up on mandatory CPD progress."
            : "Good learning progress.",
      },
    });
  }

  return prisma.organizationMember.findMany({
    where: {
      organizationId,
    },
    select: {
      id: true,
      userId: true,
      jobRole: true,
      departmentId: true,
    },
  });
};

const getAssignmentRecipients = (
  members: OrganizationMemberSeedItem[],
  assignment: {
    targetKind: P.AssignmentTargetKind;
    departmentId?: string | null;
    targetMemberId?: string | null;
  },
): OrganizationMemberSeedItem[] => {
  if (assignment.targetKind === P.AssignmentTargetKind.ALL) return members;
  if (
    assignment.targetKind === P.AssignmentTargetKind.DEPARTMENT &&
    assignment.departmentId
  )
    return members.filter(
      (member) => member.departmentId === assignment.departmentId,
    );
  if (
    assignment.targetKind === P.AssignmentTargetKind.MEMBER &&
    assignment.targetMemberId
  )
    return members.filter((member) => member.id === assignment.targetMemberId);
  if (assignment.targetKind === P.AssignmentTargetKind.ROLE) return members;
  return [];
};

const getRecipientProgress = (status: P.AssignmentStatus): number => {
  if (status === P.AssignmentStatus.COMPLETED) return 100;
  if (status === P.AssignmentStatus.ARCHIVED) return randomInt(20, 80);
  return randomInt(0, 100);
};

const seedAssignmentRecipients = async (
  prisma: P.PrismaClient,
  assignmentId: string,
  recipients: OrganizationMemberSeedItem[],
  status: P.AssignmentStatus,
) => {
  for (const recipient of recipients) {
    const progress = getRecipientProgress(status);
    await prisma.organizationAssignmentRecipient.upsert({
      where: {
        assignmentId_memberId: {
          assignmentId,
          memberId: recipient.id,
        },
      },
      create: {
        assignmentId,
        memberId: recipient.id,
        progress,
        completedAt: progress >= 100 ? randomPastDate(60) : null,
      },
      update: {
        progress,
        completedAt: progress >= 100 ? randomPastDate(60) : null,
      },
    });
  }
};

const seedOrganizationAssignments = async (
  prisma: P.PrismaClient,
  organizationId: string,
  ownerId: string,
  members: OrganizationMemberSeedItem[],
  departments: DepartmentSeedItem[],
  courses: LearningContentSeedItem[],
  events: LearningContentSeedItem[],
) => {
  if (!members.length) return;
  const assignmentTemplates = [
    {
      title: "Mandatory Compliance Refresher",
      description:
        "Required compliance learning for all active organization members.",
      type: P.AssignmentType.HARD,
      status: P.AssignmentStatus.ACTIVE,
      targetKind: P.AssignmentTargetKind.ALL,
      courseId: courses[0]?.id ?? null,
      eventId: null,
      dueDate: randomFutureDate(45),
    },
    {
      title: "Leadership Development Track",
      description:
        "Leadership-focused development assignment for team leads and managers.",
      type: P.AssignmentType.SOFT,
      status: P.AssignmentStatus.ACTIVE,
      targetKind: P.AssignmentTargetKind.DEPARTMENT,
      departmentId: departments[0]?.id ?? null,
      courseId: courses[1]?.id ?? null,
      eventId: null,
      dueDate: randomFutureDate(80),
    },
    {
      title: "Technical CPD Workshop",
      description:
        "Technical learning event assigned to improve practical capability.",
      type: P.AssignmentType.HARD,
      status: P.AssignmentStatus.ACTIVE,
      targetKind: P.AssignmentTargetKind.DEPARTMENT,
      departmentId: departments[1]?.id ?? null,
      courseId: null,
      eventId: events[0]?.id ?? null,
      dueDate: randomFutureDate(60),
    },
    {
      title: "Individual Development Assignment",
      description:
        "Individual assignment for member-specific development follow-up.",
      type: P.AssignmentType.SOFT,
      status: P.AssignmentStatus.ACTIVE,
      targetKind: P.AssignmentTargetKind.MEMBER,
      targetMemberId: members[0]?.id ?? null,
      courseId: courses[2]?.id ?? null,
      eventId: null,
      dueDate: randomFutureDate(35),
    },
    {
      title: "Completed Annual CPD Requirement",
      description:
        "Completed assignment used to test completed assignment reporting.",
      type: P.AssignmentType.HARD,
      status: P.AssignmentStatus.COMPLETED,
      targetKind: P.AssignmentTargetKind.ALL,
      courseId: courses[3]?.id ?? null,
      eventId: null,
      dueDate: randomPastDate(30),
    },
    {
      title: "Archived Onboarding Training",
      description:
        "Archived learning assignment used to test archive state and filters.",
      type: P.AssignmentType.SOFT,
      status: P.AssignmentStatus.ARCHIVED,
      targetKind: P.AssignmentTargetKind.ROLE,
      targetRole: P.Role.PROFESSIONAL,
      courseId: null,
      eventId: events[1]?.id ?? null,
      dueDate: randomPastDate(90),
    },
  ] satisfies Array<{
    title: string;
    description: string;
    type: P.AssignmentType;
    status: P.AssignmentStatus;
    targetKind: P.AssignmentTargetKind;
    departmentId?: string | null;
    targetRole?: P.Role | null;
    targetMemberId?: string | null;
    courseId?: string | null;
    eventId?: string | null;
    dueDate?: Date | null;
  }>;

  for (const template of assignmentTemplates) {
    if (!template.courseId && !template.eventId) continue;
    const existing = await prisma.organizationAssignment.findFirst({
      where: {
        organizationId,
        title: template.title,
      },
      select: {
        id: true,
      },
    });
    const data = {
      organizationId,
      createdById: ownerId,
      courseId: template.courseId ?? null,
      eventId: template.eventId ?? null,
      title: template.title,
      description: template.description,
      type: template.type,
      status: template.status,
      targetKind: template.targetKind,
      departmentId: template.departmentId ?? null,
      targetRole: template.targetRole ?? null,
      targetMemberId: template.targetMemberId ?? null,
      dueDate: template.dueDate ?? null,
    };

    const assignment = existing
      ? await prisma.organizationAssignment.update({
          where: {
            id: existing.id,
          },
          data,
          select: {
            id: true,
            status: true,
            targetKind: true,
            departmentId: true,
            targetMemberId: true,
          },
        })
      : await prisma.organizationAssignment.create({
          data,
          select: {
            id: true,
            status: true,
            targetKind: true,
            departmentId: true,
            targetMemberId: true,
          },
        });

    const recipients = getAssignmentRecipients(members, {
      targetKind: assignment.targetKind,
      departmentId: assignment.departmentId,
      targetMemberId: assignment.targetMemberId,
    });

    await seedAssignmentRecipients(
      prisma,
      assignment.id,
      recipients,
      assignment.status,
    );
  }
};

const seedOrganizationAccessRequests = async (
  prisma: P.PrismaClient,
): Promise<void> => {
  const admin = await prisma.user.findFirst({
    where: {
      role: P.Role.ADMIN,
      status: P.UserStatus.ACTIVE,
      deletedAt: null,
    },
    select: {
      id: true,
    },
  });

  const requests = [
    {
      representativeFullName: "Maya Schneider",
      organizationName: "NorthStar CPD Alliance",
      workEmail: "maya.schneider@northstar-cpd.dev",
      organizationType: P.OrganizationType.COMPANY,
      representativeJobRole: "Head of Learning",
      expectedLicensedProfessionals: 120,
      country: "Germany",
      goals:
        "Track compliance, assign CPD learning and monitor licensed professional progress.",
      status: P.OrganizationAccessRequestStatus.PENDING,
      rejectReason: null,
    },
    {
      representativeFullName: "Olivier Martin",
      organizationName: "MedPro Learning Group",
      workEmail: "olivier.martin@medpro-learning.dev",
      organizationType: P.OrganizationType.ASSOCIATION,
      representativeJobRole: "Compliance Director",
      expectedLicensedProfessionals: 85,
      country: "France",
      goals:
        "Centralize CPD tracking and produce quarterly compliance reports.",
      status: P.OrganizationAccessRequestStatus.REJECTED,
      rejectReason: "Missing legal verification documents.",
    },
  ] satisfies Array<{
    representativeFullName: string;
    organizationName: string;
    workEmail: string;
    organizationType: P.OrganizationType;
    representativeJobRole: string;
    expectedLicensedProfessionals: number;
    country: string;
    goals: string;
    status: P.OrganizationAccessRequestStatus;
    rejectReason: string | null;
  }>;

  for (const request of requests) {
    const existing = await prisma.organizationAccessRequest.findFirst({
      where: {
        workEmail: request.workEmail,
      },
      select: {
        id: true,
      },
    });
    const data = {
      representativeFullName: request.representativeFullName,
      organizationName: request.organizationName,
      workEmail: request.workEmail,
      organizationType: request.organizationType,
      representativeJobRole: request.representativeJobRole,
      expectedLicensedProfessionals: request.expectedLicensedProfessionals,
      country: request.country,
      goals: request.goals,
      status: request.status,
      reviewedById:
        request.status === P.OrganizationAccessRequestStatus.PENDING
          ? null
          : (admin?.id ?? null),
      reviewedAt:
        request.status === P.OrganizationAccessRequestStatus.PENDING
          ? null
          : new Date(),
      rejectReason: request.rejectReason,
    } satisfies P.Prisma.OrganizationAccessRequestUncheckedCreateInput;
    if (existing) {
      await prisma.organizationAccessRequest.update({
        where: {
          id: existing.id,
        },
        data,
      });
    } else {
      await prisma.organizationAccessRequest.create({
        data,
      });
    }
  }
};

export const seedOrganizationDashboard = async (
  prisma: P.PrismaClient,
): Promise<void> => {
  const organizationOwners = await prisma.user.findMany({
    where: {
      role: P.Role.ORGANIZATION,
      status: P.UserStatus.ACTIVE,
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!organizationOwners.length) {
    console.log("⚠️ No ORGANIZATION users found. Organization seed skipped.");
    return;
  }

  const professionals = await prisma.user.findMany({
    where: {
      role: P.Role.PROFESSIONAL,
      status: P.UserStatus.ACTIVE,
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!professionals.length) {
    console.log(
      "⚠️ No PROFESSIONAL users found. Organization members skipped.",
    );
    return;
  }

  const courses = await prisma.course.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
    },
    take: 20,
    orderBy: {
      createdAt: "desc",
    },
  });

  const events = await prisma.event.findMany({
    where: {
      deletedAt: null,
      status: P.EventStatus.PUBLISHED,
    },
    select: {
      id: true,
      title: true,
    },
    take: 20,
    orderBy: {
      startDate: "asc",
    },
  });

  if (!courses.length && !events.length) {
    console.log(
      "⚠️ No courses/events found. Organization assignments will be limited.",
    );
  }

  for (let index = 0; index < organizationOwners.length; index++) {
    const owner = organizationOwners[index];
    const { organization, minimumPdu } = await seedOrganizationBase(
      prisma,
      owner,
      index,
    );
    const departments = await seedOrganizationDepartments(
      prisma,
      organization.id,
    );
    await seedOrganizationCpdCategories(prisma, organization.id);
    const members = await seedOrganizationMembers(
      prisma,
      organization.id,
      professionals,
      departments,
      minimumPdu,
      index,
    );
    await seedOrganizationAssignments(
      prisma,
      organization.id,
      owner.id,
      members,
      departments,
      courses,
      events,
    );
  }
  await seedOrganizationAccessRequests(prisma);
};
