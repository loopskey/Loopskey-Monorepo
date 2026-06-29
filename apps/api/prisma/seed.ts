/// <reference types="node" />

import { seedProfessionalDashboard } from "./seeds/professional-dashboard.seed";
import { seedOrganizationDashboard } from "./seeds/organization-dashboard.seed";
import { seedProviderDashboard } from "./seeds/provider-dashboard.seed";
import { PrismaClient } from "@prisma/client";
import { seedPodcasts } from "./seeds/podcast-seed";
import { seedYouTube } from "./seeds/youtube-seed";
import { seedCourses } from "./seeds/courses-seed";
import { seedEvents } from "./seeds/events-seed";
import { seedUsers } from "./seeds/users-seed";
import { faker } from "@faker-js/faker";

import "dotenv/config";

const prisma = new PrismaClient();

const main = async () => {
  faker.seed(20260428);

  console.log("🌱 Starting LoopsKey seed...");

  const users = await seedUsers(prisma);

  await seedCourses(prisma, users);
  await seedEvents(prisma, users);
  await seedPodcasts(prisma, users);
  await seedYouTube(prisma, users);

  await seedProfessionalDashboard(prisma);
  await seedProviderDashboard(prisma);
  await seedOrganizationDashboard(prisma);

  console.log("✅ LoopsKey seed completed successfully.");
};

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
