import { PrismaClient, Role, User, UserStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";

import * as argon2 from "argon2";

export const seedUsers = async (prisma: PrismaClient): Promise<User[]> => {
  const testPassword = process.env.SEED_TEST_PASSWORD;
  if (!testPassword) throw new Error("SEED_TEST_PASSWORD is not defined");
  const passwordHash = await argon2.hash(testPassword);
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFullName = process.env.ADMIN_FULL_NAME;
  if (!adminEmail || !adminPassword || !adminFullName)
    throw new Error("Admin environment variables are missing");
  const adminPasswordHash = await argon2.hash(adminPassword);
  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    create: {
      email: adminEmail.toLowerCase(),
      fullName: adminFullName,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      firstName: adminFullName.split(" ")[0],
      lastName: adminFullName.split(" ").slice(1).join(" ") || "",
      phone: faker.phone.number(),
      avatarUrl: faker.image.avatar(),
      bio: faker.lorem.sentence(),
      phoneVerifiedAt: new Date(),
    },
    update: {
      fullName: adminFullName,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      firstName: adminFullName.split(" ")[0],
      lastName: adminFullName.split(" ").slice(1).join(" ") || "",
      phone: faker.phone.number(),
      avatarUrl: faker.image.avatar(),
      bio: faker.lorem.sentence(),
      phoneVerifiedAt: new Date(),
    },
  });

  const professionalCount = Number(process.env.SEED_PROFESSIONAL_USERS);
  const providerCount = Number(process.env.SEED_PROVIDER_USERS);
  const organizationUserCount = Number(process.env.SEED_ORG_USERS);

  const providerUsers = Array.from({ length: providerCount }).map(
    (_, index) => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;

      return {
        email: `provider.${index + 1}@loopskey.dev`,
        fullName,
        passwordHash,
        role: Role.PROVIDER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: faker.date.past({ years: 1 }),
        forcePasswordChange: false,
        firstName,
        lastName,
        phone: faker.phone.number(),
        avatarUrl: faker.image.avatar(),
        bio: faker.person.bio(),
        phoneVerifiedAt: faker.date.past({ years: 1 }),
      };
    },
  );

  const professionalUsers = Array.from({ length: professionalCount }).map(
    (_, index) => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;

      return {
        email: `professional.${index + 1}@loopskey.dev`,
        fullName,
        passwordHash,
        role: Role.PROFESSIONAL,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: faker.date.past({ years: 1 }),
        forcePasswordChange: false,
        firstName,
        lastName,
        phone: faker.phone.number(),
        avatarUrl: faker.image.avatar(),
        bio: faker.person.bio(),
        phoneVerifiedAt: faker.date.past({ years: 1 }),
      };
    },
  );

  const organizationUsers = Array.from({ length: organizationUserCount }).map(
    (_, index) => {
      const orgName = faker.company.name();
      return {
        email: `organization.${index + 1}@loopskey.dev`,
        fullName: orgName,
        passwordHash,
        role: Role.ORGANIZATION,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: faker.date.past({ years: 1 }),
        forcePasswordChange: false,
        firstName: orgName,
        lastName: "",
        phone: faker.phone.number(),
        avatarUrl: faker.image.avatar(),
        bio: faker.lorem.sentence(),
        phoneVerifiedAt: faker.date.past({ years: 1 }),
      };
    },
  );
  await prisma.user.createMany({
    data: [...providerUsers, ...professionalUsers, ...organizationUsers],
    skipDuplicates: true,
  });
  const users = await prisma.user.findMany({
    where: { status: UserStatus.ACTIVE },
  });

  return users;
};
