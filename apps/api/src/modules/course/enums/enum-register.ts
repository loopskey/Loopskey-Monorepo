import {
  CourseCategory,
  CourseLevel,
  CourseStatus,
  CurriculumLessonType,
} from "@prisma/client";
import { CourseSortField, SortDirection } from "@course/enums/sort.enum";
import { registerEnumType } from "@nestjs/graphql";

registerEnumType(CourseCategory, {
  name: "CourseCategory",
});

registerEnumType(CourseLevel, {
  name: "CourseLevel",
});

registerEnumType(CourseStatus, {
  name: "CourseStatus",
});

registerEnumType(CourseSortField, {
  name: "CourseSortField",
});

registerEnumType(SortDirection, {
  name: "SortDirection",
});

registerEnumType(CurriculumLessonType, {
  name: "CurriculumLessonType",
});
