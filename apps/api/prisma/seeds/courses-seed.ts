import { CourseCategory, CourseLevel, CourseStatus } from "@prisma/client";
import { PrismaClient, Role, User, UserStatus } from "@prisma/client";
import { CurriculumLessonType, Prisma } from "@prisma/client";
import { slugify } from "@utils/seed-helpers";
import { faker } from "@faker-js/faker";

type CourseTemplate = {
  title: string;
  level: CourseLevel;
  description: string;
  learnings: string[];
  requirements: string[];
  category: CourseCategory;
};

const curriculumSectionTitles = [
  "Case Studies",
  "Core Concepts",
  "Getting Started",
  "Tools and Workflows",
  "Practical Application",
  "Assessment and Wrap-up",
];

const lessonTitlePool = [
  "Final review",
  "Knowledge check",
  "Hands-on practice",
  "Real-world example",
  "Downloadable resources",
  "Step-by-step walkthrough",
  "Key terminology and concepts",
  "Common mistakes and best practices",
  "Introduction and learning objectives",
];

const randomLessonType = (lessonIndex: number): CurriculumLessonType => {
  if (lessonIndex % 7 === 0) return CurriculumLessonType.QUIZ;
  if (lessonIndex % 5 === 0) return CurriculumLessonType.ARTICLE;
  if (lessonIndex % 6 === 0) return CurriculumLessonType.DOWNLOAD;
  return CurriculumLessonType.VIDEO;
};

const seedCourseCurriculum = async (
  prisma: PrismaClient,
  courseId: string,
  courseTitle: string,
) => {
  await prisma.curriculumSection.deleteMany({
    where: {
      courseId,
    },
  });

  const sectionCount = faker.number.int({
    min: 3,
    max: 6,
  });

  for (let sectionIndex = 0; sectionIndex < sectionCount; sectionIndex++) {
    const sectionTitle =
      curriculumSectionTitles[sectionIndex] ??
      `${faker.word.words({ count: 2 })} Module`;

    const section = await prisma.curriculumSection.create({
      data: {
        courseId,
        order: sectionIndex + 1,
        title: sectionTitle,
        description: faker.lorem.sentence({
          min: 8,
          max: 16,
        }),
      },
    });

    const lessonCount = faker.number.int({
      min: 3,
      max: 7,
    });

    for (let lessonIndex = 0; lessonIndex < lessonCount; lessonIndex++) {
      const baseLessonTitle = faker.helpers.arrayElement(lessonTitlePool);

      await prisma.curriculumLesson.create({
        data: {
          sectionId: section.id,
          order: lessonIndex + 1,
          title:
            lessonIndex === 0 && sectionIndex === 0
              ? `Welcome to ${courseTitle}`
              : baseLessonTitle,
          description: faker.lorem.sentence({
            min: 8,
            max: 18,
          }),
          type: randomLessonType(lessonIndex),
          durationMinutes: faker.number.int({
            min: 5,
            max: 45,
          }),
          isPreview: sectionIndex === 0 && lessonIndex === 0,
        },
      });
    }
  }
};

const courseTemplates: CourseTemplate[] = [
  {
    title: "Agile Project Management",
    category: CourseCategory.BUSINESS,
    level: CourseLevel.INTERMEDIATE,
    description:
      "Learn how to manage projects using agile principles, iterative delivery, sprint planning, and stakeholder collaboration.",
    requirements: [
      "Basic understanding of project workflows",
      "Interest in agile and Scrum practices",
    ],
    learnings: [
      "Understand agile values and principles",
      "Plan and manage sprints",
      "Work with product backlogs",
      "Improve stakeholder collaboration",
    ],
  },
  {
    title: "PMP Exam Preparation",
    category: CourseCategory.CPD,
    level: CourseLevel.ADVANCED,
    description:
      "A structured preparation course for professionals planning to take the PMP exam.",
    requirements: [
      "Project management experience",
      "Familiarity with project lifecycle concepts",
    ],
    learnings: [
      "Understand PMP exam domains",
      "Practice risk and scope management",
      "Review project governance concepts",
      "Prepare with exam-style questions",
    ],
  },
  {
    title: "Scrum Master Essentials",
    category: CourseCategory.BUSINESS,
    level: CourseLevel.BEGINNER,
    description:
      "A practical introduction to Scrum roles, ceremonies, artifacts, and facilitation techniques.",
    requirements: ["No prior Scrum experience required"],
    learnings: [
      "Understand Scrum roles",
      "Facilitate Scrum ceremonies",
      "Support agile teams",
      "Remove blockers effectively",
    ],
  },
  {
    title: "Leadership for Technical Teams",
    category: CourseCategory.LEADERSHIP,
    level: CourseLevel.ALL_LEVELS,
    description:
      "Develop leadership, communication, coaching, and decision-making skills for technical environments.",
    requirements: ["Interest in leadership and team development"],
    learnings: [
      "Lead technical teams",
      "Improve communication",
      "Resolve team conflicts",
      "Build trust and accountability",
    ],
  },
  {
    title: "Effective Communication at Work",
    category: CourseCategory.BUSINESS,
    level: CourseLevel.ALL_LEVELS,
    description:
      "Improve workplace communication, professional writing, meetings, and stakeholder interactions.",
    requirements: ["No prior experience required"],
    learnings: [
      "Write clear professional messages",
      "Communicate with stakeholders",
      "Run effective meetings",
      "Handle difficult conversations",
    ],
  },
  {
    title: "React and TypeScript Bootcamp",
    category: CourseCategory.TECHNOLOGY,
    level: CourseLevel.INTERMEDIATE,
    description:
      "Build modern frontend applications with React, TypeScript, component architecture, and API integration.",
    requirements: [
      "Basic JavaScript knowledge",
      "Familiarity with HTML and CSS",
    ],
    learnings: [
      "Build reusable React components",
      "Use TypeScript with React",
      "Manage forms and validation",
      "Connect frontend to APIs",
    ],
  },
  {
    title: "Data Analysis with Python",
    category: CourseCategory.TECHNOLOGY,
    level: CourseLevel.INTERMEDIATE,
    description:
      "Analyze real-world datasets using Python, pandas, visualization techniques, and reporting workflows.",
    requirements: ["Basic Python knowledge"],
    learnings: [
      "Clean datasets",
      "Analyze data with pandas",
      "Create visual reports",
      "Communicate insights clearly",
    ],
  },
  {
    title: "Machine Learning Fundamentals",
    category: CourseCategory.TECHNOLOGY,
    level: CourseLevel.BEGINNER,
    description:
      "Understand the foundations of machine learning, model training, evaluation, and practical use cases.",
    requirements: ["Basic programming knowledge is helpful"],
    learnings: [
      "Understand supervised learning",
      "Train simple models",
      "Evaluate model performance",
      "Identify suitable ML use cases",
    ],
  },
  {
    title: "Cloud and DevOps Basics",
    category: CourseCategory.TECHNOLOGY,
    level: CourseLevel.BEGINNER,
    description:
      "Learn the basics of cloud infrastructure, CI/CD, containers, deployment, and monitoring.",
    requirements: ["Basic software development knowledge"],
    learnings: [
      "Understand cloud services",
      "Use basic CI/CD concepts",
      "Learn container fundamentals",
      "Monitor deployed applications",
    ],
  },
  {
    title: "Cybersecurity Awareness for Professionals",
    category: CourseCategory.COMPLIANCE,
    level: CourseLevel.BEGINNER,
    description:
      "Understand cybersecurity risks, phishing, password hygiene, and secure workplace practices.",
    requirements: ["No technical background required"],
    learnings: [
      "Recognize phishing attempts",
      "Improve password security",
      "Protect sensitive data",
      "Apply safe digital habits",
    ],
  },
  {
    title: "Professional Ethics and Compliance",
    category: CourseCategory.COMPLIANCE,
    level: CourseLevel.ALL_LEVELS,
    description:
      "A practical course on ethics, compliance, privacy, accountability, and professional conduct.",
    requirements: ["Interest in professional compliance"],
    learnings: [
      "Understand ethics frameworks",
      "Identify compliance risks",
      "Document decisions clearly",
      "Prepare for audits",
    ],
  },
  {
    title: "UX Design Foundations",
    category: CourseCategory.DESIGN,
    level: CourseLevel.BEGINNER,
    description:
      "Learn user-centered design principles, wireframing, accessibility, and usability basics.",
    requirements: ["No design background required"],
    learnings: [
      "Understand user needs",
      "Create simple wireframes",
      "Improve usability",
      "Apply accessibility principles",
    ],
  },
  {
    title: "Digital Marketing Strategy",
    category: CourseCategory.MARKETING,
    level: CourseLevel.INTERMEDIATE,
    description:
      "Develop digital marketing campaigns, content strategy, conversion funnels, and performance tracking.",
    requirements: ["Basic marketing knowledge is helpful"],
    learnings: [
      "Define marketing goals",
      "Plan campaigns",
      "Measure performance",
      "Improve conversion rates",
    ],
  },
];

const extraCourseTitles = [
  "Stakeholder Management",
  "Risk Management in Projects",
  "Earned Value Management",
  "Project Scheduling and Control",
  "Hybrid Project Management",
  "REST APIs with Node.js",
  "Full-Stack Web Development",
  "Docker and Kubernetes Basics",
  "Time Management for Professionals",
  "Critical Thinking and Problem Solving",
  "Technical Writing for Professionals",
  "AI Tools for Professional Productivity",
  "Business Analysis Essentials",
  "Strategic Planning for Organizations",
  "Certificate Program Design",
  "Workplace Safety and Compliance Essentials",
  "Advanced Webinar Facilitation",
  "Mentoring and Coaching Skills",
  "Quality Management Fundamentals",
  "Client Relationship Management",
];

const randomCategory = () =>
  faker.helpers.arrayElement(Object.values(CourseCategory));

const randomLevel = () =>
  faker.helpers.arrayElement(Object.values(CourseLevel));

const randomStatus = (index: number): CourseStatus => {
  if (index % 11 === 0) return CourseStatus.DRAFT;
  if (index % 17 === 0) return CourseStatus.ARCHIVED;
  return CourseStatus.PUBLISHED;
};

const buildCourseTemplates = (count: number): CourseTemplate[] => {
  const result: CourseTemplate[] = [...courseTemplates];
  for (let index = result.length; index < count; index++) {
    const baseTitle = faker.helpers.arrayElement(extraCourseTitles);
    const title =
      index < extraCourseTitles.length + courseTemplates.length
        ? baseTitle
        : `${baseTitle} ${Math.floor(index / extraCourseTitles.length) + 1}`;
    result.push({
      title,
      category: randomCategory(),
      level: randomLevel(),
      description: faker.lorem.paragraphs({ min: 1, max: 2 }),
      requirements: [
        faker.lorem.sentence({ min: 5, max: 9 }),
        faker.lorem.sentence({ min: 5, max: 9 }),
        faker.lorem.sentence({ min: 5, max: 9 }),
      ],
      learnings: [
        faker.lorem.sentence({ min: 5, max: 9 }),
        faker.lorem.sentence({ min: 5, max: 9 }),
        faker.lorem.sentence({ min: 5, max: 9 }),
        faker.lorem.sentence({ min: 5, max: 9 }),
      ],
    });
  }
  return result;
};

export const seedCourses = async (prisma: PrismaClient, allUsers: User[]) => {
  const courseCount = Number(process.env.SEED_COURSES);
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
  const templates = buildCourseTemplates(courseCount);
  for (let index = 0; index < templates.length; index++) {
    const template = templates[index];
    const provider = faker.helpers.arrayElement(providers);
    const isFree = index % 5 === 0;
    const price = isFree
      ? null
      : new Prisma.Decimal(
          faker.helpers.arrayElement([19, 29, 49, 79, 99, 149, 199, 299]),
        );
    const slug = slugify(template.title);
    const rating = Number(
      faker.number.float({
        min: 3.5,
        max: 5,
        fractionDigits: 1,
      }),
    );
    const ratingCount = faker.number.int({
      min: 10,
      max: 1500,
    });
    const course = await prisma.course.upsert({
      where: {
        slug,
      },
      create: {
        slug,
        title: template.title,
        instructor: provider.fullName ?? "LoopsKey Provider",
        imageUrl: `https://picsum.photos/seed/${slug}/900/520`,
        description: template.description,
        category: template.category,
        level: template.level,
        status: randomStatus(index),
        price,
        currency: "USD",
        isFree,
        durationMinutes: faker.helpers.arrayElement([
          30, 45, 60, 90, 120, 180, 240, 360, 480,
        ]),
        lastUpdatedAt: faker.date.recent({ days: 90 }),
        requirements: template.requirements,
        learnings: template.learnings,
        rating,
        ratingCount,
        professionals: faker.number.int({
          min: 50,
          max: 15000,
        }),
        isFeatured: index % 8 === 0,
        providerId: provider.id,
      },
      update: {
        instructor: provider.fullName ?? "LoopsKey Provider",
        imageUrl: `https://picsum.photos/seed/${slug}/900/520`,
        description: template.description,
        category: template.category,
        level: template.level,
        status: randomStatus(index),
        price,
        currency: "USD",
        isFree,
        durationMinutes: faker.helpers.arrayElement([
          30, 45, 60, 90, 120, 180, 240, 360, 480,
        ]),
        lastUpdatedAt: faker.date.recent({ days: 90 }),
        requirements: template.requirements,
        learnings: template.learnings,
        rating,
        ratingCount,
        professionals: faker.number.int({
          min: 50,
          max: 15000,
        }),
        isFeatured: index % 8 === 0,
        providerId: provider.id,
        deletedAt: null,
      },
    });
    await seedCourseCurriculum(prisma, course.id, template.title);
  }
  await prisma.course.count();
};
