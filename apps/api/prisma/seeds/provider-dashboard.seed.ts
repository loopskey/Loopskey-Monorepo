import { faker } from "@faker-js/faker";

import * as P from "@prisma/client";

const promotionTypes: P.PromotionType[] = [
  P.PromotionType.FEATURED_LISTING,
  P.PromotionType.EMAIL_CAMPAIGN,
  P.PromotionType.SOCIAL_MEDIA_BOOST,
  P.PromotionType.COMBO_PACKAGE,
];

const promotionStatuses: P.PromotionRequestStatus[] = [
  P.PromotionRequestStatus.PENDING,
  P.PromotionRequestStatus.APPROVED,
  P.PromotionRequestStatus.REJECTED,
  P.PromotionRequestStatus.CANCELLED,
];

const registrationStatuses: P.EventRegistrationStatus[] = [
  P.EventRegistrationStatus.REGISTERED,
  P.EventRegistrationStatus.REGISTERED,
  P.EventRegistrationStatus.ATTENDED,
  P.EventRegistrationStatus.COMPLETED,
  P.EventRegistrationStatus.CANCELLED,
];

const eventStatuses: P.EventStatus[] = [
  P.EventStatus.PUBLISHED,
  P.EventStatus.PUBLISHED,
  P.EventStatus.PUBLISHED,
  P.EventStatus.DRAFT,
  P.EventStatus.ARCHIVED,
];

const providerOrganizations = [
  {
    organizationName: "LoopsKey Professional Academy",
    organizationProfile:
      "A professional learning provider focused on CPD, leadership and digital skills.",
    aboutOrganization:
      "We help professionals grow through high-quality courses, workshops, webinars and accredited learning events.",
  },
  {
    organizationName: "Global Skills Institute",
    organizationProfile:
      "International training provider for business, technology and compliance programs.",
    aboutOrganization:
      "Our mission is to make professional development measurable, practical and career-focused.",
  },
  {
    organizationName: "FutureWork Learning Hub",
    organizationProfile:
      "A modern education provider delivering events and programs for the future of work.",
    aboutOrganization:
      "We design learning experiences for professionals, teams and organizations across multiple industries.",
  },
  {
    organizationName: "Strategic CPD Center",
    organizationProfile:
      "CPD provider specialized in project management, business strategy and leadership.",
    aboutOrganization:
      "We support professionals with structured learning paths, events, assessments and certifications.",
  },
];

const randomItem = <TItem>(items: TItem[]): TItem =>
  items[Math.floor(Math.random() * items.length)];

const randomInt = (min: number, max: number): number =>
  faker.number.int({ min, max });

const randomFloat = (min: number, max: number, precision = 2): number =>
  Number(
    faker.number.float({
      min,
      max,
      fractionDigits: precision,
    }),
  );

const randomDateBetween = (start: Date, end: Date): Date =>
  faker.date.between({ from: start, to: end });

const getCurrentYearStart = (): Date => {
  const date = new Date();
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const buildPromotionRejectReason = (status: P.PromotionRequestStatus) => {
  if (status !== P.PromotionRequestStatus.REJECTED) return null;
  return randomItem([
    "Budget does not meet the minimum campaign requirement.",
    "The event content needs additional review before promotion.",
    "Promotion request rejected due to incomplete event information.",
  ]);
};

const buildReviewedAt = (status: P.PromotionRequestStatus) => {
  if (
    status === P.PromotionRequestStatus.APPROVED ||
    status === P.PromotionRequestStatus.REJECTED ||
    status === P.PromotionRequestStatus.CANCELLED
  )
    return faker.date.recent({ days: 20 });
  return null;
};

const buildAttendedAt = (
  status: P.EventRegistrationStatus,
  registrationDate: Date,
): Date | null => {
  if (
    status === P.EventRegistrationStatus.ATTENDED ||
    status === P.EventRegistrationStatus.COMPLETED
  )
    return faker.date.between({
      from: registrationDate,
      to: new Date(),
    });
  return null;
};

const buildCompletedAt = (
  status: P.EventRegistrationStatus,
  attendedAt: Date | null,
): Date | null => {
  if (status !== P.EventRegistrationStatus.COMPLETED) return null;
  return attendedAt
    ? faker.date.between({
        from: attendedAt,
        to: new Date(),
      })
    : faker.date.recent({ days: 15 });
};

const seedProviderSettings = async (
  prisma: P.PrismaClient,
  provider: {
    id: string;
    email: string | null;
    fullName: string | null;
  },
  index: number,
) => {
  const organization =
    providerOrganizations[index % providerOrganizations.length];
  await prisma.providerSettings.upsert({
    where: {
      providerId: provider.id,
    },
    create: {
      providerId: provider.id,
      organizationName: organization.organizationName,
      organizationProfile: organization.organizationProfile,
      aboutOrganization: organization.aboutOrganization,
      contactEmail: provider.email ?? `provider-${index + 1}@loopskey.dev`,
      newRegistrationAlertEnabled: true,
      eventReminderEnabled: true,
      reminderHoursBeforeEvent: randomItem([12, 24, 48]),
    },
    update: {
      organizationName: organization.organizationName,
      organizationProfile: organization.organizationProfile,
      aboutOrganization: organization.aboutOrganization,
      contactEmail: provider.email ?? `provider-${index + 1}@loopskey.dev`,
      newRegistrationAlertEnabled: true,
      eventReminderEnabled: true,
      reminderHoursBeforeEvent: randomItem([12, 24, 48]),
    },
  });
};

const seedProviderEventQualityData = async (
  prisma: P.PrismaClient,
  providerId: string,
) => {
  const providerEvents = await prisma.event.findMany({
    where: {
      providerId,
      deletedAt: null,
    },
    select: {
      id: true,
      isFree: true,
      price: true,
      status: true,
      startDate: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  for (let index = 0; index < providerEvents.length; index++) {
    const event = providerEvents[index];
    const status =
      index < 3 ? P.EventStatus.PUBLISHED : randomItem(eventStatuses);
    await prisma.event.update({
      where: {
        id: event.id,
      },
      data: {
        status,
        views: randomInt(120, 2500),
        averageRating: randomFloat(3.4, 5),
        rating: randomFloat(3.4, 5),
        isFree: index % 4 === 0,
        price:
          index % 4 === 0
            ? new P.Prisma.Decimal(0)
            : new P.Prisma.Decimal(randomItem([29, 49, 79, 99, 149])),
      },
    });
  }
  return providerEvents;
};

const seedProviderRegistrations = async (
  prisma: P.PrismaClient,
  providerId: string,
) => {
  const professionals = await prisma.user.findMany({
    where: {
      role: P.Role.PROFESSIONAL,
      status: P.UserStatus.ACTIVE,
      deletedAt: null,
    },
    select: {
      id: true,
    },
    take: 80,
  });
  if (!professionals.length) {
    console.log(
      "⚠️ No PROFESSIONAL users found. Provider registrations seed skipped.",
    );
    return;
  }

  const providerEvents = await prisma.event.findMany({
    where: {
      providerId,
      deletedAt: null,
      status: {
        in: [P.EventStatus.PUBLISHED, P.EventStatus.DRAFT],
      },
    },
    select: {
      id: true,
      startDate: true,
    },
    take: 12,
  });

  for (const event of providerEvents) {
    const attendeeCount = randomInt(8, 28);
    const shuffledUsers = faker.helpers
      .shuffle(professionals)
      .slice(0, attendeeCount);
    for (const professional of shuffledUsers) {
      const status = randomItem(registrationStatuses);
      const registrationDate = randomDateBetween(
        getCurrentYearStart(),
        new Date(),
      );
      const attendedAt = buildAttendedAt(status, registrationDate);
      const completedAt = buildCompletedAt(status, attendedAt);
      await prisma.eventRegistration.upsert({
        where: {
          eventId_userId: {
            eventId: event.id,
            userId: professional.id,
          },
        },
        create: {
          eventId: event.id,
          userId: professional.id,
          status,
          createdAt: registrationDate,
          attendedAt,
          completedAt,
        },
        update: {
          status,
          attendedAt,
          completedAt,
        },
      });
    }
  }
};

const seedProviderPromotionRequests = async (
  prisma: P.PrismaClient,
  providerId: string,
  adminId?: string,
) => {
  const providerEvents = await prisma.event.findMany({
    where: {
      providerId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
    },
    take: 10,
  });
  for (let index = 0; index < providerEvents.length; index++) {
    const event = providerEvents[index];
    const status = promotionStatuses[index % promotionStatuses.length];
    const promotionType = promotionTypes[index % promotionTypes.length];
    const existing = await prisma.eventPromotionRequest.findFirst({
      where: {
        providerId,
        eventId: event.id,
        promotionType,
      },
      select: {
        id: true,
      },
    });
    const data = {
      providerId,
      eventId: event.id,
      promotionType,
      budget: new P.Prisma.Decimal(randomItem([150, 250, 500, 750, 1200])),
      note: `Seed promotion request for "${event.title}" using ${promotionType.toLowerCase().replaceAll("_", " ")}.`,
      status,
      reviewedById:
        status === P.PromotionRequestStatus.PENDING ? null : (adminId ?? null),
      reviewedAt: buildReviewedAt(status),
      rejectReason: buildPromotionRejectReason(status),
    };
    if (existing) {
      await prisma.eventPromotionRequest.update({
        where: {
          id: existing.id,
        },
        data,
      });
    } else {
      await prisma.eventPromotionRequest.create({
        data,
      });
    }
  }
};

const validateProviderDashboardSeed = async (
  prisma: P.PrismaClient,
  provider: {
    id: string;
    email: string | null;
    fullName: string | null;
  },
) => {
  await prisma.event.count({
    where: {
      providerId: provider.id,
      deletedAt: null,
    },
  });
};

export const seedProviderDashboard = async (
  prisma: P.PrismaClient,
): Promise<void> => {
  const providers = await prisma.user.findMany({
    where: {
      role: P.Role.PROVIDER,
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

  if (!providers.length) {
    console.log("⚠️ No PROVIDER users found. Provider dashboard seed skipped.");
    return;
  }

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

  for (let index = 0; index < providers.length; index++) {
    const provider = providers[index];
    await seedProviderSettings(prisma, provider, index);
    await validateProviderDashboardSeed(prisma, provider);
    await seedProviderEventQualityData(prisma, provider.id);
    await seedProviderRegistrations(prisma, provider.id);
    await seedProviderPromotionRequests(prisma, provider.id, admin?.id);
  }
};
