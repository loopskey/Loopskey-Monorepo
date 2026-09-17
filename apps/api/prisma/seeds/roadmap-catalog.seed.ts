import * as P from "@prisma/client";

// The Professional dashboard's Roadmap tab enrolls professionals into
// catalog Roadmap rows (see seedProfessionalRoadmaps in
// professional-dashboard.seed.ts), but nothing seeded the catalog itself —
// so the tab was empty for every professional. This fills that gap with a
// small, fixed, published catalog.
const roadmapTemplates: Array<{
  slug: string;
  title: string;
  description: string;
  category: P.CourseCategory;
  level: P.CourseLevel;
  estimatedWeeks: number;
  coverageNote: string;
  phases: Array<{
    title: string;
    description: string;
    estimatedWeeks: number;
    steps: Array<{ title: string; description: string; estimatedMinutes: number; credits: number }>;
  }>;
}> = [
  {
    slug: "cpd-foundations-roadmap",
    title: "CPD Foundations",
    description: "A structured path through core CPD skills and record-keeping habits.",
    category: P.CourseCategory.BUSINESS,
    level: P.CourseLevel.BEGINNER,
    estimatedWeeks: 6,
    coverageNote: "Covers ethics, evidence practices and annual planning.",
    phases: [
      {
        title: "Getting Started",
        description: "Understand CPD cycles and how credits are tracked.",
        estimatedWeeks: 2,
        steps: [
          { title: "What counts as CPD", description: "Overview of eligible activity types.", estimatedMinutes: 30, credits: 0.5 },
          { title: "Keeping evidence", description: "How to log evidence for reviewed activities.", estimatedMinutes: 45, credits: 0.5 },
        ],
      },
      {
        title: "Building the habit",
        description: "Plan and log a full reporting year.",
        estimatedWeeks: 4,
        steps: [
          { title: "Set annual targets", description: "Define category targets for the year.", estimatedMinutes: 40, credits: 1 },
          { title: "Mid-year review", description: "Check progress against targets.", estimatedMinutes: 30, credits: 0.5 },
        ],
      },
    ],
  },
  {
    slug: "leadership-growth-roadmap",
    title: "Leadership Growth Track",
    description: "Develop leadership and people-management capability alongside CPD credit.",
    category: P.CourseCategory.LEADERSHIP,
    level: P.CourseLevel.INTERMEDIATE,
    estimatedWeeks: 8,
    coverageNote: "Covers coaching, delegation and difficult conversations.",
    phases: [
      {
        title: "Foundations of Leadership",
        description: "Core leadership styles and self-assessment.",
        estimatedWeeks: 3,
        steps: [
          { title: "Leadership styles", description: "Identify your default leadership style.", estimatedMinutes: 35, credits: 1 },
          { title: "Giving feedback", description: "Structured feedback techniques.", estimatedMinutes: 40, credits: 1 },
        ],
      },
      {
        title: "Applied Leadership",
        description: "Practice leadership skills in real scenarios.",
        estimatedWeeks: 5,
        steps: [
          { title: "Delegation practice", description: "Delegate a real task using the RACI method.", estimatedMinutes: 45, credits: 1.5 },
          { title: "Difficult conversations", description: "Plan and hold a hard conversation.", estimatedMinutes: 50, credits: 1.5 },
        ],
      },
    ],
  },
  {
    slug: "digital-ai-readiness-roadmap",
    title: "Digital & AI Readiness",
    description: "Build practical fluency with digital tools and AI in professional practice.",
    category: P.CourseCategory.TECHNOLOGY,
    level: P.CourseLevel.ALL_LEVELS,
    estimatedWeeks: 5,
    coverageNote: "Covers AI-assisted workflows and digital compliance basics.",
    phases: [
      {
        title: "Orientation",
        description: "Where AI fits into everyday professional work.",
        estimatedWeeks: 2,
        steps: [
          { title: "AI in practice", description: "Realistic use cases for AI tools at work.", estimatedMinutes: 30, credits: 0.5 },
        ],
      },
      {
        title: "Applying it safely",
        description: "Use AI tools while respecting data and compliance rules.",
        estimatedWeeks: 3,
        steps: [
          { title: "Data handling basics", description: "What not to share with external AI tools.", estimatedMinutes: 35, credits: 1 },
          { title: "Building a workflow", description: "Automate one routine task responsibly.", estimatedMinutes: 45, credits: 1 },
        ],
      },
    ],
  },
];

export const seedRoadmapCatalog = async (prisma: P.PrismaClient): Promise<void> => {
  for (const template of roadmapTemplates) {
    const roadmap = await prisma.roadmap.upsert({
      where: { slug: template.slug },
      create: {
        slug: template.slug,
        title: template.title,
        description: template.description,
        category: template.category,
        level: template.level,
        status: P.RoadmapStatus.PUBLISHED,
        source: P.RoadmapSource.CATALOG,
        estimatedWeeks: template.estimatedWeeks,
        coverageNote: template.coverageNote,
      },
      update: {
        title: template.title,
        description: template.description,
        category: template.category,
        level: template.level,
        status: P.RoadmapStatus.PUBLISHED,
        estimatedWeeks: template.estimatedWeeks,
        coverageNote: template.coverageNote,
      },
      select: { id: true },
    });

    for (const [phaseOrder, phase] of template.phases.entries()) {
      const savedPhase = await prisma.roadmapPhase.upsert({
        where: { roadmapId_order: { roadmapId: roadmap.id, order: phaseOrder } },
        create: {
          roadmapId: roadmap.id,
          title: phase.title,
          description: phase.description,
          order: phaseOrder,
          estimatedWeeks: phase.estimatedWeeks,
        },
        update: {
          title: phase.title,
          description: phase.description,
          estimatedWeeks: phase.estimatedWeeks,
        },
        select: { id: true },
      });

      for (const [stepOrder, step] of phase.steps.entries()) {
        await prisma.roadmapStep.upsert({
          where: { phaseId_order: { phaseId: savedPhase.id, order: stepOrder } },
          create: {
            phaseId: savedPhase.id,
            title: step.title,
            description: step.description,
            order: stepOrder,
            estimatedMinutes: step.estimatedMinutes,
            credits: step.credits,
          },
          update: {
            title: step.title,
            description: step.description,
            estimatedMinutes: step.estimatedMinutes,
            credits: step.credits,
          },
        });
      }
    }
  }
};
