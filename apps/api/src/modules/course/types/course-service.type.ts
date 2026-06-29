import { CourseSortField, SortDirection } from "@course/enums/sort.enum";
import { CourseCategory, CourseLevel } from "@prisma/client";
import { CourseStatus, Prisma, Role } from "@prisma/client";

export type TCourseRequester = {
  id: string;
  role: Role;
};

export type TFindCoursesArgs = {
  filter?: {
    search?: string;
    isFree?: boolean;
    level?: CourseLevel;
    providerId?: string;
    isFeatured?: boolean;
    status?: CourseStatus;
    category?: CourseCategory;
  };
  pagination?: {
    take?: number;
    cursor?: string;
  };
  sort?: {
    field?: CourseSortField;
    direction?: SortDirection;
  };
};

export type TCourseWhereInput = Prisma.CourseWhereInput;

export type TCurrentUserPayload = {
  id: string;
  role: Role;
  sub?: string;
};
