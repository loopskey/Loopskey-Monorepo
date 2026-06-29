import { PrismaClient, Role, User, UserStatus } from "@prisma/client";
import { YouTubeCategory, YouTubeVideoStatus } from "@prisma/client";
import { YouTubeChannelStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const channelTitles = [
  "Professional Learning Hub",
  "AI Skills Academy",
  "Project Management TV",
  "Engineering CPD Channel",
  "Leadership Learning Lab",
  "Data Career School",
  "Cybersecurity Explained",
  "Business Growth Lessons",
  "Healthcare Compliance Channel",
  "Cloud DevOps Academy",
  "Marketing Strategy Studio",
  "Design Thinking Channel",
  "Career Skills Network",
  "Agile Practice TV",
  "Finance Learning Room",
];

const videoTitlePool = [
  "Getting Started with Professional Development",
  "Common Mistakes and How to Avoid Them",
  "Best Practices for Continuous Learning",
  "Expert Interview and Practical Advice",
  "Real-World Case Study",
  "Tools and Frameworks Explained",
  "How to Track Your Progress",
  "Future Trends and Opportunities",
  "Practical Checklist for Professionals",
  "Lessons Learned from Industry Experts",
];

const randomStatus = (index: number): YouTubeChannelStatus => {
  if (index % 10 === 0) return YouTubeChannelStatus.DRAFT;
  if (index % 17 === 0) return YouTubeChannelStatus.ARCHIVED;
  return YouTubeChannelStatus.PUBLISHED;
};

export const seedYouTube = async (prisma: PrismaClient, allUsers: User[]) => {
  const channelCount = Number(process.env.SEED_YOUTUBE_CHANNELS ?? 50);
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
  for (let index = 0; index < channelCount; index++) {
    const baseTitle = faker.helpers.arrayElement(channelTitles);
    const title =
      index < channelTitles.length
        ? baseTitle
        : `${baseTitle} ${Math.floor(index / channelTitles.length) + 1}`;
    const slug = slugify(title);
    const providerUser = faker.helpers.arrayElement(providers);
    const videoCount = faker.number.int({
      min: 5,
      max: 45,
    });
    const channelViews = faker.number.int({
      min: 1000,
      max: 2500000,
    });
    const channel = await prisma.youTubeChannel.upsert({
      where: { slug },
      create: {
        slug,
        title,
        description: faker.lorem.paragraphs({ min: 1, max: 2 }),
        provider: providerUser.fullName ?? faker.company.name(),
        imageUrl: `https://picsum.photos/seed/youtube-${slug}/900/520`,
        channelUrl: faker.internet.url(),
        subscribers: faker.number.int({
          min: 100,
          max: 500000,
        }),
        views: channelViews,
        videoCount,
        category: faker.helpers.arrayElement(Object.values(YouTubeCategory)),
        status: randomStatus(index),
        isFeatured: index % 8 === 0,
        providerId: providerUser.id,
      },
      update: {
        description: faker.lorem.paragraphs({ min: 1, max: 2 }),
        provider: providerUser.fullName ?? faker.company.name(),
        imageUrl: `https://picsum.photos/seed/youtube-${slug}/900/520`,
        channelUrl: faker.internet.url(),
        subscribers: faker.number.int({
          min: 100,
          max: 500000,
        }),
        views: channelViews,
        videoCount,
        category: faker.helpers.arrayElement(Object.values(YouTubeCategory)),
        status: randomStatus(index),
        isFeatured: index % 8 === 0,
        providerId: providerUser.id,
        deletedAt: null,
      },
    });
    const existingVideos = await prisma.youTubeVideo.count({
      where: {
        channelId: channel.id,
      },
    });
    if (existingVideos > 0) continue;
    for (let videoIndex = 1; videoIndex <= videoCount; videoIndex++) {
      const videoTitle = `${faker.helpers.arrayElement(
        videoTitlePool,
      )}: ${faker.lorem.words({ min: 2, max: 5 })}`;
      await prisma.youTubeVideo.create({
        data: {
          channelId: channel.id,
          title: videoTitle,
          description: faker.lorem.paragraph(),
          thumbnailUrl: `https://picsum.photos/seed/youtube-video-${slug}-${videoIndex}/900/520`,
          videoUrl: faker.internet.url(),
          durationMinutes: faker.number.int({
            min: 4,
            max: 90,
          }),
          views: faker.number.int({
            min: 50,
            max: 200000,
          }),
          likes: faker.number.int({
            min: 1,
            max: 30000,
          }),
          status: faker.helpers.arrayElement([
            YouTubeVideoStatus.PUBLISHED,
            YouTubeVideoStatus.PUBLISHED,
            YouTubeVideoStatus.PUBLISHED,
            YouTubeVideoStatus.DRAFT,
          ]),
          publishedAt: faker.date.past({
            years: 3,
          }),
        },
      });
    }
  }
  await prisma.youTubeChannel.count();
};
