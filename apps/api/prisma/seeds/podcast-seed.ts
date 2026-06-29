import { PodcastCategory, PodcastStatus, UserStatus } from "@prisma/client";
import { PrismaClient, Role, User } from "@prisma/client";
import { faker } from "@faker-js/faker";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const podcastTitles = [
  "The Professional Growth Show",
  "AI for Learning Leaders",
  "Project Management Insights",
  "Engineering Career Talks",
  "Leadership in Practice",
  "The CPD Podcast",
  "Future Skills Weekly",
  "Data-Driven Professionals",
  "Business Strategy Talks",
  "Healthcare Compliance Today",
  "Cybersecurity for Everyone",
  "Digital Transformation Radio",
  "Marketing Growth Lab",
  "Design Thinking Sessions",
  "Career Skills Minute",
];

const episodeTitlePool = [
  "Getting Started",
  "Common Mistakes",
  "Best Practices",
  "Expert Interview",
  "Real-World Case Study",
  "Tools and Frameworks",
  "How to Measure Progress",
  "Trends and Future Outlook",
  "Practical Checklist",
  "Lessons Learned",
];

const randomStatus = (index: number): PodcastStatus => {
  if (index % 10 === 0) return PodcastStatus.DRAFT;
  if (index % 17 === 0) return PodcastStatus.ARCHIVED;
  return PodcastStatus.PUBLISHED;
};

export const seedPodcasts = async (prisma: PrismaClient, allUsers: User[]) => {
  const podcastCount = Number(process.env.SEED_PODCASTS ?? 60);
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
  for (let index = 0; index < podcastCount; index++) {
    const baseTitle = faker.helpers.arrayElement(podcastTitles);
    const title =
      index < podcastTitles.length
        ? baseTitle
        : `${baseTitle} ${Math.floor(index / podcastTitles.length) + 1}`;
    const slug = slugify(title);
    const provider = faker.helpers.arrayElement(providers);
    const episodeCount = faker.number.int({ min: 5, max: 40 });
    const totalDuration = faker.number.int({
      min: episodeCount * 12,
      max: episodeCount * 55,
    });
    const podcast = await prisma.podcast.upsert({
      where: { slug },
      create: {
        slug,
        title,
        host: faker.person.fullName(),
        imageUrl: `https://picsum.photos/seed/podcast-${slug}/900/520`,
        description: faker.lorem.paragraphs({ min: 1, max: 2 }),
        category: faker.helpers.arrayElement(Object.values(PodcastCategory)),
        status: randomStatus(index),
        rating: Number(
          faker.number.float({
            min: 3.5,
            max: 5,
            fractionDigits: 1,
          }),
        ),
        ratingCount: faker.number.int({ min: 5, max: 900 }),
        listeners: faker.number.int({ min: 100, max: 50000 }),
        durationMinutes: totalDuration,
        episodeCount,
        isFeatured: index % 8 === 0,
        providerId: provider.id,
      },
      update: {
        host: faker.person.fullName(),
        imageUrl: `https://picsum.photos/seed/podcast-${slug}/900/520`,
        description: faker.lorem.paragraphs({ min: 1, max: 2 }),
        category: faker.helpers.arrayElement(Object.values(PodcastCategory)),
        status: randomStatus(index),
        rating: Number(
          faker.number.float({
            min: 3.5,
            max: 5,
            fractionDigits: 1,
          }),
        ),
        ratingCount: faker.number.int({ min: 5, max: 900 }),
        listeners: faker.number.int({ min: 100, max: 50000 }),
        durationMinutes: totalDuration,
        episodeCount,
        isFeatured: index % 8 === 0,
        providerId: provider.id,
        deletedAt: null,
      },
    });

    const existingEpisodes = await prisma.podcastEpisode.count({
      where: { podcastId: podcast.id },
    });
    if (existingEpisodes > 0) continue;
    for (
      let episodeNumber = 1;
      episodeNumber <= episodeCount;
      episodeNumber++
    ) {
      const episodeTitle = `${faker.helpers.arrayElement(
        episodeTitlePool,
      )}: ${faker.lorem.words({ min: 2, max: 5 })}`;
      await prisma.podcastEpisode.create({
        data: {
          podcastId: podcast.id,
          episodeNumber,
          title: episodeTitle,
          description: faker.lorem.paragraph(),
          audioUrl: faker.internet.url(),
          durationMinutes: faker.number.int({ min: 12, max: 55 }),
          publishedAt: faker.date.past({ years: 2 }),
        },
      });
    }
  }
  await prisma.podcast.count();
};
