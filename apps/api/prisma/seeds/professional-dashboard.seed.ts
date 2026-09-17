import * as P from "@prisma/client";

const PROFESSIONAL_FAKE_PREFIX = "professional-dashboard-seed";

type SeedCourseItem = {
  id: string;
  title: string;
  price: unknown;
  isFree: boolean;
  currency: string | null;
  type: (typeof P.ContentType)["COURSE"];
};

type SeedEventItem = {
  id: string;
  title: string;
  price: unknown;
  isFree: boolean;
  startDate: Date;
  pdu: number | null;
  currency: string | null;
  pduCategory: P.PDUCategory | null;
  type: (typeof P.ContentType)["EVENT"];
};

type SeedContentItem = SeedCourseItem | SeedEventItem;

const pduCategories: P.PDUCategory[] = [
  P.PDUCategory.ETHICS,
  P.PDUCategory.BUSINESS,
  P.PDUCategory.TECHNICAL,
  P.PDUCategory.STRATEGIC,
  P.PDUCategory.LEADERSHIP,
  P.PDUCategory.COMPLIANCE,
  P.PDUCategory.COMMUNICATION,
  P.PDUCategory.DIGITAL_AI,
  P.PDUCategory.RESEARCH_INNOVATION,
  P.PDUCategory.INDUSTRY_KNOWLEDGE,
  P.PDUCategory.PROFESSIONAL_PRACTICE,
];

const pduSources: P.PDUSource[] = [
  P.PDUSource.EVENT,
  P.PDUSource.COURSE,
  P.PDUSource.WEBINAR,
  P.PDUSource.PODCAST,
  P.PDUSource.YOUTUBE,
  P.PDUSource.WORKSHOP,
  P.PDUSource.SEMINAR,
  P.PDUSource.CONFERENCE,
  P.PDUSource.SELF_STUDY,
  P.PDUSource.MENTORSHIP,
  P.PDUSource.TRAINING_SESSION,
];

const creditTypes: P.CreditType[] = [
  P.CreditType.PDU,
  P.CreditType.CPD,
  P.CreditType.CEU,
  P.CreditType.TRAINING_HOUR,
];

const pduProviders = [
  "Loopskey Academy",
  "Global CPD Institute",
  "Project Management Institute",
  "IEEE Learning Network",
  "Coursera for Business",
];

const jobProfiles = [
  {
    industry: P.ProfessionalIndustry.TECHNOLOGY,
    currentRole: "Project Manager",
    profession: "Digital Project Manager",
    skillKeys: ["PROJECT_MANAGEMENT", "TEAM_LEADERSHIP", "RISK_MANAGEMENT"],
    subjectKeys: ["PROJECT_MANAGEMENT", "PEOPLE_MANAGEMENT"],
    improveKeys: ["NEGOTIATION", "CHANGE_MANAGEMENT"],
    skills: ["Agile", "Scrum", "Leadership", "Risk Management"],
    interests: ["PDU", "Leadership", "Project Delivery", "Career Growth"],
  },
  {
    industry: P.ProfessionalIndustry.FINANCE,
    currentRole: "Business Analyst",
    profession: "Senior Business Analyst",
    skillKeys: ["DATA_ANALYTICS", "BUSINESS_STRATEGY", "FINANCE_ACCOUNTING"],
    subjectKeys: ["CORPORATE_FINANCE", "STRATEGY"],
    improveKeys: ["PRESENTATION_SKILLS"],
    skills: [
      "Data Analysis",
      "Requirements Analysis",
      "Stakeholder Management",
    ],
    interests: ["Business Strategy", "Analytics", "Process Improvement"],
  },
  {
    industry: P.ProfessionalIndustry.TECHNOLOGY,
    currentRole: "Software Engineer",
    profession: "Full Stack Developer",
    skillKeys: [
      "SOFTWARE_ENGINEERING",
      "CLOUD_INFRASTRUCTURE",
      "QUALITY_TESTING",
    ],
    subjectKeys: ["SOFTWARE_DEVELOPMENT", "CLOUD_COMPUTING"],
    improveKeys: ["ARTIFICIAL_INTELLIGENCE"],
    skills: ["TypeScript", "NestJS", "React", "System Design"],
    interests: ["Software Architecture", "Cloud", "AI", "Professional Growth"],
  },
  {
    industry: P.ProfessionalIndustry.HEALTHCARE,
    currentRole: "Compliance Officer",
    profession: "Compliance Specialist",
    skillKeys: [
      "REGULATORY_COMPLIANCE",
      "PROFESSIONAL_ETHICS",
      "RISK_MANAGEMENT",
    ],
    subjectKeys: ["PATIENT_SAFETY", "REGULATORY_AFFAIRS"],
    improveKeys: ["PRIVACY_DATA_PROTECTION"],
    skills: ["Compliance", "Audit", "Policy Review", "Risk Assessment"],
    interests: ["Ethics", "Compliance", "Healthcare Standards"],
  },
  {
    industry: P.ProfessionalIndustry.EDUCATION,
    currentRole: "Learning Specialist",
    profession: "Learning & Development Consultant",
    skillKeys: ["COACHING_MENTORING", "FACILITATION", "TECHNICAL_WRITING"],
    subjectKeys: ["INSTRUCTIONAL_DESIGN", "ADULT_LEARNING"],
    improveKeys: ["UX_RESEARCH"],
    skills: [
      "Training",
      "Coaching",
      "Curriculum Design",
      "Instructional Design",
    ],
    interests: ["CPD", "Adult Learning", "Workshops", "Certifications"],
  },
];

const experienceRanges = [
  P.ExperienceRange.ONE_TO_TWO_YEARS,
  P.ExperienceRange.THREE_TO_FIVE_YEARS,
  P.ExperienceRange.SIX_TO_TEN_YEARS,
  P.ExperienceRange.ELEVEN_TO_FIFTEEN_YEARS,
];

const countryCodes = ["AE", "FR", "DE", "CA", "NL", "GB"];
const timeZones = [
  "Asia/Dubai",
  "Europe/Paris",
  "Europe/Berlin",
  "America/Toronto",
  "Europe/Amsterdam",
  "Europe/London",
];

const locations = [
  "Dubai, UAE",
  "Paris, France",
  "Berlin, Germany",
  "Toronto, Canada",
  "Amsterdam, Netherlands",
  "London, United Kingdom",
];

const certificateTitles = [
  "Technical CPD Achievement",
  "Agile Delivery Certificate",
  "Business Strategy Certificate",
  "Compliance Training Certificate",
  "Leadership Essentials Certificate",
  "Professional Development Certificate",
  "Data Analytics Foundation Certificate",
];

const certificateIssuers = [
  "LoopsKey Academy",
  "International CPD Hub",
  "Digital Skills Academy",
  "Professional Learning Center",
  "Global Professional Institute",
];

const randomItem = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min: number, max: number, precision = 1): number =>
  Number((Math.random() * (max - min) + min).toFixed(precision));

const chance = (percentage: number): boolean =>
  Math.random() < percentage / 100;

const randomDateBetween = (start: Date, end: Date): Date =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const randomDateInYear = (year: number): Date =>
  randomDateBetween(
    new Date(Date.UTC(year, 0, 1)),
    new Date(Date.UTC(year, 11, 31, 23, 59, 59)),
  );

const buildVerificationCode = (userId: string, index: number): string =>
  `LK-${userId.slice(-6).toUpperCase()}-${String(index + 1).padStart(4, "0")}`;

const toPaymentAmount = (price: unknown, fallback = 49): number => {
  if (price === null || price === undefined) return fallback;
  if (typeof price === "number") return price;
  if (typeof price === "string") {
    const parsed = Number(price);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (
    typeof price === "object" &&
    price !== null &&
    "toNumber" in price &&
    typeof price.toNumber === "function"
  )
    return price.toNumber();
  return fallback;
};

const buildContentTitle = (source: P.PDUSource, index: number) => {
  const sourceLabel = source.toLowerCase();
  return `${sourceLabel} professional development activity ${index + 1}`;
};

const mapSourceToContentType = (source: P.PDUSource): P.ContentType | null => {
  if (source === P.PDUSource.COURSE) return P.ContentType.COURSE;
  if (source === P.PDUSource.EVENT) return P.ContentType.EVENT;
  if (source === P.PDUSource.PODCAST) return P.ContentType.PODCAST;
  if (source === P.PDUSource.YOUTUBE) return P.ContentType.YOUTUBE;
  return null;
};

const pickContentBySource = (
  source: P.PDUSource,
  courses: SeedCourseItem[],
  events: SeedEventItem[],
): SeedContentItem | null => {
  if (source === P.PDUSource.COURSE && courses.length)
    return randomItem(courses);
  if (source === P.PDUSource.EVENT && events.length) return randomItem(events);
  const combined = [...courses, ...events];
  return combined.length ? randomItem(combined) : null;
};

const deleteOldProfessionalFakeDashboardData = async (
  prisma: P.PrismaClient,
  userId: string,
) => {
  await prisma.pDUActivity.deleteMany({
    where: {
      userId,
      description: {
        contains: PROFESSIONAL_FAKE_PREFIX,
      },
    },
  });
  await prisma.payment.deleteMany({
    where: {
      userId,
      providerPaymentId: {
        startsWith: "fake_professional_payment_",
      },
    },
  });
  await prisma.certificate.deleteMany({
    where: {
      userId,
      verificationCode: {
        startsWith: `LK-${userId.slice(-6).toUpperCase()}-`,
      },
    },
  });
  await prisma.calendarEvent.deleteMany({
    where: {
      userId,
      notes: {
        contains: PROFESSIONAL_FAKE_PREFIX,
      },
    },
  });
  const oldPlans = await prisma.cPDPlan.findMany({
    where: { userId, organization: { contains: PROFESSIONAL_FAKE_PREFIX } },
    select: { id: true },
  });
  if (oldPlans.length) {
    await prisma.cPDPlanCategory.deleteMany({
      where: { planId: { in: oldPlans.map((plan) => plan.id) } },
    });
    await prisma.cPDPlan.deleteMany({
      where: { id: { in: oldPlans.map((plan) => plan.id) } },
    });
  }
};

const seedProfessionalProfile = async (
  prisma: P.PrismaClient,
  professional: {
    id: string;
    fullName: string | null;
    email: string | null;
  },
  index: number,
) => {
  const profile = jobProfiles[index % jobProfiles.length];
  const locationIndex = index % countryCodes.length;

  const data = {
    profession: profile.profession,
    industry: profile.industry,
    currentRole: profile.currentRole,
    experienceRange: randomItem(experienceRanges),
    workLocation: randomItem(locations),
    professionalSummary: `${profile.profession} focused on continuous professional development and measurable learning outcomes.`,
    countryCode: countryCodes[locationIndex],
    timeZone: timeZones[locationIndex],
    language: P.AppLanguage.EN,
    linkedInUrl: `https://www.linkedin.com/in/loopskey-${professional.id.slice(-8)}`,
    currentSkillLevel: P.SkillLevel.INTERMEDIATE,
    targetSkillLevel: P.SkillLevel.ADVANCED,
    preferredLearningFormats: [
      P.LearningFormat.COURSE,
      P.LearningFormat.WEBINAR,
    ],
    learningTimeCommitment: P.LearningTimeCommitment.FOUR_TO_SIX_HOURS,
    learningBudgetPreference: P.LearningBudgetPreference.MIXED_FREE_AND_PAID,
    // Legacy columns are still populated so compatibility consumers keep working.
    skills: profile.skills,
    interests: profile.interests,
    website: `https://portfolio-${professional.id.slice(-8)}.loopskey.dev`,
    education: randomItem([
      "Bachelor's Degree",
      "Master's Degree",
      "Professional Diploma",
      "Certified Professional Program",
    ]),
  };

  const saved = await prisma.professionalProfile.upsert({
    where: { userId: professional.id },
    create: { userId: professional.id, ...data },
    update: data,
    select: { id: true },
  });

  await seedProfileTerms(prisma, saved.id, profile);
};

const seedProfileTerms = async (
  prisma: P.PrismaClient,
  profileId: string,
  profile: (typeof jobProfiles)[number],
) => {
  const selections: [P.ProfileTaxonomyKind, P.ProfileTermUsage, string[]][] = [
    [
      P.ProfileTaxonomyKind.SKILL_AREA,
      P.ProfileTermUsage.MAIN_SKILL,
      profile.skillKeys,
    ],
    [
      P.ProfileTaxonomyKind.SUBJECT,
      P.ProfileTermUsage.FAVORITE_SUBJECT,
      profile.subjectKeys,
    ],
    [
      P.ProfileTaxonomyKind.SKILL_AREA,
      P.ProfileTermUsage.SKILL_TO_IMPROVE,
      profile.improveKeys,
    ],
  ];

  for (const [kind, usage, keys] of selections) {
    const terms = await prisma.profileTaxonomyTerm.findMany({
      where: { kind, key: { in: keys } },
      select: { id: true },
    });
    await prisma.professionalProfileTerm.createMany({
      data: terms.map((term) => ({ profileId, termId: term.id, usage })),
      skipDuplicates: true,
    });
  }
};

const seedProfessionalSettings = async (
  prisma: P.PrismaClient,
  userId: string,
  index: number,
) => {
  await prisma.professionalSettings.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      interfaceLanguage: P.AppLanguage.EN,
      theme:
        index % 3 === 0
          ? P.AppTheme.SYSTEM
          : index % 3 === 1
            ? P.AppTheme.LIGHT
            : P.AppTheme.DARK,
    },
    update: {
      interfaceLanguage: P.AppLanguage.EN,
    },
  });
};

const seedProfessionalCredential = async (
  prisma: P.PrismaClient,
  userId: string,
  index: number,
  certifications: Array<{ id: string; creditType: P.CreditType }>,
) => {
  if (!certifications.length) return;
  const certification = certifications[index % certifications.length];
  const issueDate = randomDateBetween(
    new Date(Date.UTC(new Date().getFullYear() - 3, 0, 1)),
    new Date(),
  );
  await prisma.professionalCredential.upsert({
    where: { userId_certificationId: { userId, certificationId: certification.id } },
    create: {
      userId,
      certificationId: certification.id,
      name: `Professional credential ${index + 1}`,
      issuingOrganization: "LoopsKey Academy",
      licenceNumber: `LK-CRED-${userId.slice(-6).toUpperCase()}`,
      issueDate,
      expiryDate: new Date(issueDate.getFullYear() + 2, issueDate.getMonth(), issueDate.getDate()),
      annualCpdHours: randomFloat(10, 40),
    },
    update: {
      issuingOrganization: "LoopsKey Academy",
      annualCpdHours: randomFloat(10, 40),
    },
  });
};

const seedProfessionalPduTargets = async (
  prisma: P.PrismaClient,
  userId: string,
  currentYear: number,
) => {
  for (const category of pduCategories) {
    await prisma.pDUTarget.upsert({
      where: {
        userId_year_category: {
          userId,
          year: currentYear,
          category,
        },
      },
      create: {
        userId,
        year: currentYear,
        category,
        target: randomFloat(8, 20),
      },
      update: {
        target: randomFloat(8, 20),
      },
    });
  }
};

const seedProfessionalPduActivities = async (
  prisma: P.PrismaClient,
  userId: string,
  currentYear: number,
  courses: SeedCourseItem[],
  events: SeedEventItem[],
) => {
  const statuses = [
    P.PDUStatus.PENDING,
    P.PDUStatus.APPROVED,
    P.PDUStatus.APPROVED,
    P.PDUStatus.APPROVED,
    P.PDUStatus.REJECTED,
  ];
  const usedContentIds = new Set<string>();
  for (let i = 0; i < 18; i++) {
    const status = randomItem(statuses);
    const source = randomItem(pduSources);
    const category = randomItem(pduCategories);
    const fallbackContentType = mapSourceToContentType(source);
    const rawLinkedContent = pickContentBySource(source, courses, events);
    // PDUActivity has a partial unique index on (userId, contentType, contentId)
    // (migration 20260828140000_concurrency_safety) — never reuse a contentId
    // for the same user within this loop or the create() below fails P2002.
    const linkedContent =
      rawLinkedContent && !usedContentIds.has(rawLinkedContent.id)
        ? rawLinkedContent
        : null;
    if (linkedContent) usedContentIds.add(linkedContent.id);
    const date = randomDateInYear(currentYear);
    await prisma.pDUActivity.create({
      data: {
        userId,
        title: buildContentTitle(source, i),
        description: `${PROFESSIONAL_FAKE_PREFIX}: Auto-generated PDU activity for professional dashboard testing.`,
        source,
        category,
        status,
        pdus: randomFloat(0.5, 8),
        date,
        creditType: randomItem(creditTypes),
        completionStatus: P.PDUCompletionStatus.COMPLETED,
        reportingYear: date.getUTCFullYear(),
        providerOrganizer: randomItem(pduProviders),
        issuingOrganization: randomItem(pduProviders),
        learningOutcome: `${PROFESSIONAL_FAKE_PREFIX}: Applied the ${category.toLowerCase()} concepts from this activity to day-to-day project work.`,
        evidenceUrl:
          status === P.PDUStatus.APPROVED
            ? `https://loopskey.local/evidence/${userId}-${i + 1}.pdf`
            : null,
        contentType: linkedContent?.type ?? fallbackContentType,
        contentId: linkedContent?.id ?? null,
      },
    });
  }
};

const seedProfessionalCourses = async (
  prisma: P.PrismaClient,
  userId: string,
  courses: SeedCourseItem[],
) => {
  const selectedCourses = courses.slice(0, 6);
  for (let i = 0; i < selectedCourses.length; i++) {
    const course = selectedCourses[i];
    const isCompleted = i % 3 === 0;
    await prisma.contentEnrollment.upsert({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType: P.ContentType.COURSE,
          contentId: course.id,
        },
      },
      create: {
        userId,
        contentType: P.ContentType.COURSE,
        contentId: course.id,
        status: isCompleted
          ? P.ContentEnrollmentStatus.COMPLETED
          : P.ContentEnrollmentStatus.ACTIVE,
        progress: isCompleted ? 100 : randomInt(15, 85),
        completedAt: isCompleted
          ? randomDateInYear(new Date().getFullYear())
          : null,
      },
      update: {
        status: isCompleted
          ? P.ContentEnrollmentStatus.COMPLETED
          : P.ContentEnrollmentStatus.ACTIVE,
        progress: isCompleted ? 100 : randomInt(15, 85),
        completedAt: isCompleted
          ? randomDateInYear(new Date().getFullYear())
          : null,
      },
    });
  }
};

const seedProfessionalEvents = async (
  prisma: P.PrismaClient,
  userId: string,
  events: SeedEventItem[],
) => {
  const selectedEvents = events.slice(0, 6);
  for (let i = 0; i < selectedEvents.length; i++) {
    const event = selectedEvents[i];
    const status =
      i % 4 === 0
        ? P.EventRegistrationStatus.COMPLETED
        : i % 4 === 1
          ? P.EventRegistrationStatus.ATTENDED
          : P.EventRegistrationStatus.REGISTERED;
    await prisma.eventRegistration.upsert({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId,
        },
      },
      create: {
        eventId: event.id,
        userId,
        status,
        attendedAt:
          status === P.EventRegistrationStatus.ATTENDED ||
          status === P.EventRegistrationStatus.COMPLETED
            ? randomDateInYear(new Date().getFullYear())
            : null,
        completedAt:
          status === P.EventRegistrationStatus.COMPLETED
            ? randomDateInYear(new Date().getFullYear())
            : null,
      },
      update: {
        status,
        attendedAt:
          status === P.EventRegistrationStatus.ATTENDED ||
          status === P.EventRegistrationStatus.COMPLETED
            ? randomDateInYear(new Date().getFullYear())
            : null,
        completedAt:
          status === P.EventRegistrationStatus.COMPLETED
            ? randomDateInYear(new Date().getFullYear())
            : null,
      },
    });

    await prisma.contentEnrollment.upsert({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType: P.ContentType.EVENT,
          contentId: event.id,
        },
      },
      create: {
        userId,
        contentType: P.ContentType.EVENT,
        contentId: event.id,
        status:
          status === P.EventRegistrationStatus.COMPLETED
            ? P.ContentEnrollmentStatus.COMPLETED
            : P.ContentEnrollmentStatus.ACTIVE,
        progress:
          status === P.EventRegistrationStatus.COMPLETED
            ? 100
            : randomInt(10, 90),
        completedAt:
          status === P.EventRegistrationStatus.COMPLETED
            ? randomDateInYear(new Date().getFullYear())
            : null,
      },
      update: {
        status:
          status === P.EventRegistrationStatus.COMPLETED
            ? P.ContentEnrollmentStatus.COMPLETED
            : P.ContentEnrollmentStatus.ACTIVE,
        progress:
          status === P.EventRegistrationStatus.COMPLETED
            ? 100
            : randomInt(10, 90),
        completedAt:
          status === P.EventRegistrationStatus.COMPLETED
            ? randomDateInYear(new Date().getFullYear())
            : null,
      },
    });
  }
};

const certificateStateFor = (
  index: number,
): { status: P.CertificateStatus; validUntil: Date | null } => {
  const now = new Date();
  const remainder = index % 5;
  if (remainder === 0)
    return { status: P.CertificateStatus.EXPIRING_SOON, validUntil: randomDateBetween(now, new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)) };
  if (remainder === 1)
    return { status: P.CertificateStatus.EXPIRED, validUntil: randomDateBetween(new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000), new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)) };
  if (remainder === 2) return { status: P.CertificateStatus.REVOKED, validUntil: null };
  return {
    status: P.CertificateStatus.ACTIVE,
    validUntil: chance(70) ? new Date(now.getFullYear() + 2, 11, 31) : null,
  };
};

const seedProfessionalCertificates = async (
  prisma: P.PrismaClient,
  userId: string,
  currentYear: number,
  contents: SeedContentItem[],
) => {
  const certificateCount = 5;
  for (let i = 0; i < certificateCount; i++) {
    const linkedContent = contents.length ? randomItem(contents) : null;
    const { status, validUntil } = certificateStateFor(i);
    await prisma.certificate.upsert({
      where: {
        verificationCode: buildVerificationCode(userId, i),
      },
      create: {
        userId,
        title: certificateTitles[i % certificateTitles.length],
        issuer: randomItem(certificateIssuers),
        certificateUrl: `https://loopskey.local/certificates/${userId}-${i + 1}.pdf`,
        verificationCode: buildVerificationCode(userId, i),
        contentType: linkedContent?.type ?? null,
        contentId: linkedContent?.id ?? null,
        pduEarned: randomFloat(2, 12),
        issuedAt: randomDateInYear(currentYear),
        validUntil,
        status,
      },
      update: {
        title: certificateTitles[i % certificateTitles.length],
        issuer: randomItem(certificateIssuers),
        certificateUrl: `https://loopskey.local/certificates/${userId}-${i + 1}.pdf`,
        contentType: linkedContent?.type ?? null,
        contentId: linkedContent?.id ?? null,
        pduEarned: randomFloat(2, 12),
        issuedAt: randomDateInYear(currentYear),
        validUntil,
        status,
      },
    });
  }
};

const seedProfessionalPayments = async (
  prisma: P.PrismaClient,
  userId: string,
  currentYear: number,
  courses: SeedCourseItem[],
  events: SeedEventItem[],
) => {
  const paidItems = [...courses.slice(0, 4), ...events.slice(0, 3)];
  for (const item of paidItems) {
    const amount = item.isFree ? 0 : toPaymentAmount(item.price, 49);
    await prisma.payment.create({
      data: {
        userId,
        contentType: item.type,
        contentId: item.id,
        title: item.title,
        amount,
        currency: item.currency ?? "USD",
        status: P.PaymentStatus.PAID,
        providerPaymentId: `fake_professional_payment_${userId}_${item.id}`,
        receiptUrl: `https://loopskey.local/receipts/${userId}-${item.id}.pdf`,
        paidAt: randomDateInYear(currentYear),
      },
    });
  }
  if (courses[7]) {
    await prisma.payment.create({
      data: {
        userId,
        contentType: P.ContentType.COURSE,
        contentId: courses[7].id,
        title: courses[7].title,
        amount: toPaymentAmount(courses[7].price, 79),
        currency: courses[7].currency ?? "USD",
        status: P.PaymentStatus.PENDING,
        providerPaymentId: `fake_professional_payment_pending_${userId}_${courses[7].id}`,
        receiptUrl: null,
        paidAt: null,
      },
    });
  }
};

const calendarEventTypes: P.CalendarEventType[] = [
  P.CalendarEventType.EVENT,
  P.CalendarEventType.COURSE,
  P.CalendarEventType.WEBINAR,
  P.CalendarEventType.MEETING,
  P.CalendarEventType.TRAINING,
  P.CalendarEventType.OTHER,
];

const seedProfessionalCalendarEvents = async (
  prisma: P.PrismaClient,
  userId: string,
  courses: SeedCourseItem[],
  events: SeedEventItem[],
) => {
  const now = new Date();
  const eventCount = 8;
  for (let i = 0; i < eventCount; i++) {
    const type = calendarEventTypes[i % calendarEventTypes.length];
    const offsetDays = randomInt(-30, 45) + i * 3;
    const startDate = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);
    const durationMinutes = randomItem([30, 60, 90, 120]);
    const linkedContent =
      type === P.CalendarEventType.COURSE && courses.length
        ? randomItem(courses)
        : type === P.CalendarEventType.EVENT && events.length
          ? randomItem(events)
          : null;

    await prisma.calendarEvent.create({
      data: {
        userId,
        title: linkedContent?.title ?? `${type.toLowerCase()} session ${i + 1}`,
        type,
        startDate,
        endDate: new Date(startDate.getTime() + durationMinutes * 60 * 1000),
        durationMinutes,
        notes: `${PROFESSIONAL_FAKE_PREFIX}: Auto-generated calendar entry for dashboard testing.`,
        contentType: linkedContent?.type ?? null,
        contentId: linkedContent?.id ?? null,
      },
    });
  }
};

const cpdPlanCategoryTemplates = [
  { name: "Technical Skills", share: 0.5 },
  { name: "Leadership", share: 0.3 },
  { name: "Ethics", share: 0.2 },
];

const seedProfessionalCpdPlans = async (
  prisma: P.PrismaClient,
  userId: string,
  currentYear: number,
) => {
  const plans: Array<{
    certificationName: string;
    status: P.CPDPlanStatus;
    totalRequiredCredits: number;
    initialCompletedCredits: number;
  }> = [
    {
      certificationName: "Certified Professional Development Practitioner",
      status: P.CPDPlanStatus.ACTIVE,
      totalRequiredCredits: 40,
      initialCompletedCredits: randomFloat(10, 28),
    },
    {
      certificationName: "Foundational CPD Renewal",
      status: P.CPDPlanStatus.COMPLETED,
      totalRequiredCredits: 20,
      initialCompletedCredits: 20,
    },
  ];

  for (const plan of plans) {
    const reportingStart = new Date(Date.UTC(currentYear, 0, 1));
    const reportingEnd = new Date(Date.UTC(currentYear, 11, 31));
    const created = await prisma.cPDPlan.create({
      data: {
        userId,
        certificationName: plan.certificationName,
        organization: `${PROFESSIONAL_FAKE_PREFIX} Institute`,
        reportingStart,
        reportingEnd,
        creditType: P.CreditType.CPD,
        totalRequiredCredits: plan.totalRequiredCredits,
        initialCompletedCredits: plan.initialCompletedCredits,
        timeAvailable: P.LearningTimeCommitment.FOUR_TO_SIX_HOURS,
        preferredFormats: [P.LearningFormat.COURSE, P.LearningFormat.WEBINAR],
        evidenceTypes: [P.CPDEvidenceType.CERTIFICATE, P.CPDEvidenceType.SELF_DECLARATION],
        reportRecipientType: P.CPDReportRecipientType.SELF,
        remindersEnabled: true,
        reminderTiming: P.CPDReminderTiming.DAYS_30,
        status: plan.status,
      },
      select: { id: true },
    });

    for (const [order, category] of cpdPlanCategoryTemplates.entries()) {
      const targetCredits = Number((plan.totalRequiredCredits * category.share).toFixed(1));
      await prisma.cPDPlanCategory.create({
        data: {
          planId: created.id,
          name: category.name,
          targetCredits,
          completedCredits:
            plan.status === P.CPDPlanStatus.COMPLETED
              ? targetCredits
              : Number((targetCredits * randomFloat(0.3, 0.8)).toFixed(1)),
          order,
        },
      });
    }
  }
};

const seedProfessionalRoadmaps = async (
  prisma: P.PrismaClient,
  userId: string,
  roadmaps: Array<{ id: string; stepIds: string[] }>,
) => {
  const selectedRoadmaps = roadmaps.slice(0, 4);
  for (let i = 0; i < selectedRoadmaps.length; i++) {
    const roadmap = selectedRoadmaps[i];
    const isCompleted = i === 0;
    const enrollment = await prisma.roadmapEnrollment.upsert({
      where: {
        userId_roadmapId: {
          userId,
          roadmapId: roadmap.id,
        },
      },
      create: {
        userId,
        roadmapId: roadmap.id,
        progress: isCompleted ? 100 : randomInt(10, 85),
        status: isCompleted
          ? P.RoadmapEnrollmentStatus.COMPLETED
          : P.RoadmapEnrollmentStatus.ACTIVE,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        progress: isCompleted ? 100 : randomInt(10, 85),
        status: isCompleted
          ? P.RoadmapEnrollmentStatus.COMPLETED
          : P.RoadmapEnrollmentStatus.ACTIVE,
        completedAt: isCompleted ? new Date() : null,
      },
      select: { id: true },
    });

    for (const [stepIndex, stepId] of roadmap.stepIds.entries()) {
      const stepStatus =
        isCompleted || stepIndex === 0
          ? P.RoadmapStepProgressStatus.COMPLETED
          : P.RoadmapStepProgressStatus.IN_PROGRESS;
      await prisma.roadmapStepProgress.upsert({
        where: { enrollmentId_stepId: { enrollmentId: enrollment.id, stepId } },
        create: {
          enrollmentId: enrollment.id,
          stepId,
          status: stepStatus,
          completedAt: stepStatus === P.RoadmapStepProgressStatus.COMPLETED ? new Date() : null,
        },
        update: {
          status: stepStatus,
          completedAt: stepStatus === P.RoadmapStepProgressStatus.COMPLETED ? new Date() : null,
        },
      });
      if (!isCompleted && stepIndex >= 1) break;
    }
  }
};

const seedProfessionalWishlist = async (
  prisma: P.PrismaClient,
  userId: string,
  courses: SeedCourseItem[],
  events: SeedEventItem[],
) => {
  const wishlistItems = [...courses.slice(6, 9), ...events.slice(6, 9)];
  for (const item of wishlistItems) {
    await prisma.wishlistItem.upsert({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType: item.type,
          contentId: item.id,
        },
      },
      create: {
        userId,
        contentType: item.type,
        contentId: item.id,
      },
      update: {},
    });
  }
};

export const seedProfessionalDashboard = async (
  prisma: P.PrismaClient,
): Promise<void> => {
  const currentYear = new Date().getFullYear();
  const professionals = await prisma.user.findMany({
    where: {
      role: P.Role.PROFESSIONAL,
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
      "⚠️ No PROFESSIONAL users found. Professional dashboard seed skipped.",
    );
    return;
  }
  const rawCourses = await prisma.course.findMany({
    where: {
      deletedAt: null,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      price: true,
      isFree: true,
      currency: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
  });
  const rawEvents = await prisma.event.findMany({
    where: {
      deletedAt: null,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      price: true,
      isFree: true,
      currency: true,
      pdu: true,
      pduCategory: true,
      startDate: true,
    },
    orderBy: {
      startDate: "asc",
    },
    take: 30,
  });
  const rawRoadmaps = await prisma.roadmap.findMany({
    where: {
      deletedAt: null,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      phases: {
        orderBy: { order: "asc" },
        select: { steps: { orderBy: { order: "asc" }, select: { id: true } } },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
  });

  const roadmaps = rawRoadmaps.map((roadmap) => ({
    id: roadmap.id,
    stepIds: roadmap.phases.flatMap((phase) => phase.steps.map((step) => step.id)),
  }));

  const certifications = await prisma.certification.findMany({
    where: { isActive: true },
    select: { id: true, creditType: true },
    take: 10,
  });

  const courses: SeedCourseItem[] = rawCourses.map((course) => ({
    ...course,
    type: P.ContentType.COURSE,
  }));

  const events: SeedEventItem[] = rawEvents.map((event) => ({
    ...event,
    type: P.ContentType.EVENT,
  }));
  const contents: SeedContentItem[] = [...courses, ...events];

  if (!courses.length) {
    console.log(
      "⚠️ No published courses found. Course-related professional seed will be limited.",
    );
  }
  if (!events.length) {
    console.log(
      "⚠️ No published events found. Event-related professional seed will be limited.",
    );
  }
  for (let index = 0; index < professionals.length; index++) {
    const professional = professionals[index];
    await deleteOldProfessionalFakeDashboardData(prisma, professional.id);
    await seedProfessionalProfile(prisma, professional, index);
    await seedProfessionalSettings(prisma, professional.id, index);
    await seedProfessionalCredential(prisma, professional.id, index, certifications);
    await seedProfessionalPduTargets(prisma, professional.id, currentYear);
    await seedProfessionalPduActivities(
      prisma,
      professional.id,
      currentYear,
      courses,
      events,
    );
    if (courses.length)
      await seedProfessionalCourses(prisma, professional.id, courses);
    if (events.length)
      await seedProfessionalEvents(prisma, professional.id, events);
    await seedProfessionalCalendarEvents(prisma, professional.id, courses, events);
    await seedProfessionalCpdPlans(prisma, professional.id, currentYear);

    if (contents.length)
      await seedProfessionalCertificates(
        prisma,
        professional.id,
        currentYear,
        contents,
      );

    if (courses.length || events.length) {
      await seedProfessionalPayments(
        prisma,
        professional.id,
        currentYear,
        courses,
        events,
      );
      await seedProfessionalWishlist(prisma, professional.id, courses, events);
    }
    if (roadmaps.length)
      await seedProfessionalRoadmaps(prisma, professional.id, roadmaps);
  }
};
