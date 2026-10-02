export enum CourseGqlObjectNames {
  COURSE = "Course",
  COURSE_PAGE_INFO = "CoursePageInfo",
  CURRICULUM_LESSON = "CurriculumLesson",
  PAGINATED_COURSES = "PaginatedCourses",
  CURRICULUM_SECTION = "CurriculumSection",
  COURSE_FILTER_FACETS = "CourseFilterFacets",
  COURSE_CATEGORY_FACET = "CourseCategoryFacet",
  COURSE_LEVEL_FACET = "CourseLevelFacet",
  COURSE_RATING_FACET = "CourseRatingFacet",
}

export enum CourseGqlInputNames {
  COURSE_SORT = "CourseSortInput",
  CREATE_COURSE = "CreateCourseInput",
  UPDATE_COURSE = "UpdateCourseInput",
  COURSE_FILTER = "CourseFilterInput",
  COURSE_PAGINATION = "CoursePaginationInput",
}

export enum CourseGqlQueryNames {
  COURSES = "courses",
  COURSE_BY_ID = "courseById",
  COURSE_BY_SLUG = "courseBySlug",
  FEATURED_COURSES = "featuredCourses",
  MY_PROVIDER_COURSES = "myProviderCourses",
  COURSE_FILTER_FACETS = "courseFilterFacets",
}

export enum CourseGqlMutationNames {
  CREATE_COURSE = "createCourse",
  UPDATE_COURSE = "updateCourse",
  DELETE_COURSE = "deleteCourse",
  PUBLISH_COURSE = "publishCourse",
  RESTORE_COURSE = "restoreCourse",
  ARCHIVE_COURSE = "archiveCourse",
}
