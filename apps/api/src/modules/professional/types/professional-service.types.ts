import { Prisma, Role } from "@prisma/client";

export type TResolverUser = { id?: string; sub?: string; role: Role };

export const roadmapEnrollmentWithRoadmapArgs =
  Prisma.validator<Prisma.RoadmapEnrollmentDefaultArgs>()({
    include: {
      roadmap: {
        include: {
          phases: {
            orderBy: { order: "asc" },
            include: {
              steps: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

export type RoadmapEnrollmentWithRoadmap = Prisma.RoadmapEnrollmentGetPayload<
  typeof roadmapEnrollmentWithRoadmapArgs
>;

export type TRoadmapPhaseWithSteps =
  RoadmapEnrollmentWithRoadmap["roadmap"]["phases"][number];

export type TMappedRoadmapPhase = {
  id: string;
  title: string;
  order: number;
  progress: number;
  completed: boolean;
  stepsCount: number;
  description: string | null;
  steps: TRoadmapPhaseWithSteps["steps"];
};

export type TCalculateCalendar = {
  startDate: Date;
  endDate?: Date | null;
} | null;
