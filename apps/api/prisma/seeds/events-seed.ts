import { EventCategory, EventDeliveryMode, EventStatus } from "@prisma/client";
import { EventType, Role, User, UserStatus } from "@prisma/client";
import { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const eventTitles = [
  "Engineering Ethics Seminar",
  "Agile Delivery Masterclass",
  "AI in Professional Development",
  "Healthcare Compliance Workshop",
  "Cloud and DevOps Live Training",
  "Cybersecurity Awareness Webinar",
  "Business Communication Bootcamp",
  "Data Analytics for Professionals",
  "UX Design for Learning Platforms",
  "Sustainable Engineering Practices",
  "CPD Planning and Reporting Webinar",
  "Digital Marketing Strategy Session",
  "Risk Management in Complex Projects",
  "Project Management Leadership Summit",
  "Financial Modeling for Decision Makers",
];

const randomStatus = (index: number): EventStatus => {
  if (index % 10 === 0) return EventStatus.DRAFT;
  if (index % 21 === 0) return EventStatus.ARCHIVED;
  return EventStatus.PUBLISHED;
};

export const seedEvents = async (prisma: PrismaClient, allUsers: User[]) => {
  const eventCount = Number(process.env.SEED_EVENTS ?? 80);
  let providers = allUsers.filter(
    (user) => user.role === Role.PROVIDER && user.status === UserStatus.ACTIVE,
  );

  if (!providers.length) {
    providers = await prisma.user.findMany({
      where: {
        role: Role.PROVIDER,
        status: UserStatus.ACTIVE,
      },
    });
  }
  if (!providers.length)
    throw new Error("No active provider users found. Run seedUsers first.");
  for (let index = 0; index < eventCount; index++) {
    const baseTitle = faker.helpers.arrayElement(eventTitles);
    const title =
      index < eventTitles.length
        ? baseTitle
        : `${baseTitle} ${Math.floor(index / eventTitles.length) + 1}`;
    const slug = slugify(title);
    const provider = faker.helpers.arrayElement(providers);
    const deliveryMode = faker.helpers.arrayElement(
      Object.values(EventDeliveryMode),
    );
    const isFree = index % 4 === 0;
    const startDate = faker.date.soon({ days: 180 });
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + faker.number.int({ min: 1, max: 8 }));
    const price = isFree
      ? null
      : new Prisma.Decimal(
          faker.helpers.arrayElement([19, 29, 49, 79, 99, 149, 199]),
        );
    const attendees = faker.number.int({ min: 0, max: 900 });
    const ratingCount = faker.number.int({ min: 0, max: 300 });
    const averageRating =
      ratingCount > 0
        ? Number(faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }))
        : 0;
    await prisma.event.upsert({
      where: { slug },
      create: {
        slug,
        title,
        type: faker.helpers.arrayElement(Object.values(EventType)),
        deliveryMode,
        category: faker.helpers.arrayElement(Object.values(EventCategory)),
        status: randomStatus(index),
        imageUrl: `https://picsum.photos/seed/event-${slug}/900/520`,
        speaker: faker.person.fullName(),
        organizer: provider.fullName ?? faker.company.name(),
        description: faker.lorem.paragraphs({ min: 1, max: 2 }),
        startDate,
        endDate,
        timezone: "America/Toronto",
        location:
          deliveryMode === EventDeliveryMode.IN_PERSON ||
          deliveryMode === EventDeliveryMode.HYBRID
            ? `${faker.location.city()}, ${faker.location.country()}`
            : null,
        onlineUrl:
          deliveryMode === EventDeliveryMode.LIVE_ONLINE ||
          deliveryMode === EventDeliveryMode.HYBRID ||
          deliveryMode === EventDeliveryMode.RECORDED
            ? faker.internet.url()
            : null,
        price,
        currency: "USD",
        isFree,
        pdu: faker.number.float({ min: 0.5, max: 12, fractionDigits: 1 }),
        capacity: faker.helpers.arrayElement([50, 100, 250, 500, 1000, null]),
        attendees,
        views: faker.number.int({ min: attendees, max: attendees + 10000 }),
        rating: averageRating,
        averageRating,
        ratingCount,
        registrationEnabled: true,
        providerId: provider.id,
      },
      update: {
        type: faker.helpers.arrayElement(Object.values(EventType)),
        deliveryMode,
        category: faker.helpers.arrayElement(Object.values(EventCategory)),
        status: randomStatus(index),
        imageUrl: `https://picsum.photos/seed/event-${slug}/900/520`,
        speaker: faker.person.fullName(),
        organizer: provider.fullName ?? faker.company.name(),
        description: faker.lorem.paragraphs({ min: 1, max: 2 }),
        startDate,
        endDate,
        timezone: "America/Toronto",
        location:
          deliveryMode === EventDeliveryMode.IN_PERSON ||
          deliveryMode === EventDeliveryMode.HYBRID
            ? `${faker.location.city()}, ${faker.location.country()}`
            : null,
        onlineUrl:
          deliveryMode === EventDeliveryMode.LIVE_ONLINE ||
          deliveryMode === EventDeliveryMode.HYBRID ||
          deliveryMode === EventDeliveryMode.RECORDED
            ? faker.internet.url()
            : null,
        price,
        currency: "USD",
        isFree,
        pdu: faker.number.float({ min: 0.5, max: 12, fractionDigits: 1 }),
        capacity: faker.helpers.arrayElement([50, 100, 250, 500, 1000, null]),
        attendees,
        views: faker.number.int({ min: attendees, max: attendees + 10000 }),
        rating: averageRating,
        averageRating,
        ratingCount,
        registrationEnabled: true,
        providerId: provider.id,
        deletedAt: null,
      },
    });
  }
  await prisma.event.count();
};
