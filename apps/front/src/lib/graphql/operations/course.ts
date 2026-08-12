import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type CourseFieldsFragment = { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: Types.CourseCategory, level: Types.CourseLevel, status: Types.CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null };

export type CoursePageInfoFieldsFragment = { __typename?: 'CoursePageInfo', nextCursor?: string | null, hasNextPage: boolean };

export type CurriculumLessonFieldsFragment = { __typename?: 'CurriculumLesson', id: string, type: Types.CurriculumLessonType, title: string, order: number, isPreview: boolean, createdAt: string, updatedAt: string, sectionId: string, description?: string | null, durationMinutes?: number | null };

export type CurriculumSectionFieldsFragment = { __typename?: 'CurriculumSection', id: string, title: string, order: number, courseId: string, description?: string | null, createdAt: string, updatedAt: string, lessons: Array<{ __typename?: 'CurriculumLesson', id: string, type: Types.CurriculumLessonType, title: string, order: number, isPreview: boolean, createdAt: string, updatedAt: string, sectionId: string, description?: string | null, durationMinutes?: number | null }> };

export type CoursesQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.CourseFilterInput>;
  pagination?: Types.InputMaybe<Types.CoursePaginationInput>;
  sort?: Types.InputMaybe<Types.CourseSortInput>;
}>;


export type CoursesQuery = { __typename?: 'Query', courses: { __typename?: 'PaginatedCourses', totalCount: number, items: Array<{ __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: Types.CourseCategory, level: Types.CourseLevel, status: Types.CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, pageInfo: { __typename?: 'CoursePageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type CourseByIdQueryVariables = Types.Exact<{
  courseId: Types.Scalars['String']['input'];
}>;


export type CourseByIdQuery = { __typename?: 'Query', courseById: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: Types.CourseCategory, level: Types.CourseLevel, status: Types.CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type CourseBySlugQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
}>;


export type CourseBySlugQuery = { __typename?: 'Query', courseBySlug: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: Types.CourseCategory, level: Types.CourseLevel, status: Types.CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null, curriculumSections?: Array<{ __typename?: 'CurriculumSection', id: string, title: string, order: number, courseId: string, description?: string | null, createdAt: string, updatedAt: string, lessons: Array<{ __typename?: 'CurriculumLesson', id: string, type: Types.CurriculumLessonType, title: string, order: number, isPreview: boolean, createdAt: string, updatedAt: string, sectionId: string, description?: string | null, durationMinutes?: number | null }> }> | null } };

export type FeaturedCoursesQueryVariables = Types.Exact<{
  take?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type FeaturedCoursesQuery = { __typename?: 'Query', featuredCourses: Array<{ __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: Types.CourseCategory, level: Types.CourseLevel, status: Types.CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null }> };

export type MyProviderCoursesQueryVariables = Types.Exact<{
  filter?: Types.InputMaybe<Types.CourseFilterInput>;
  pagination?: Types.InputMaybe<Types.CoursePaginationInput>;
  sort?: Types.InputMaybe<Types.CourseSortInput>;
}>;


export type MyProviderCoursesQuery = { __typename?: 'Query', myProviderCourses: { __typename?: 'PaginatedCourses', totalCount: number, items: Array<{ __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: Types.CourseCategory, level: Types.CourseLevel, status: Types.CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null }>, pageInfo: { __typename?: 'CoursePageInfo', nextCursor?: string | null, hasNextPage: boolean } } };

export type CreateCourseMutationVariables = Types.Exact<{
  input: Types.CreateCourseInput;
}>;


export type CreateCourseMutation = { __typename?: 'Mutation', createCourse: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: Types.CourseCategory, level: Types.CourseLevel, status: Types.CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type UpdateCourseMutationVariables = Types.Exact<{
  input: Types.UpdateCourseInput;
}>;


export type UpdateCourseMutation = { __typename?: 'Mutation', updateCourse: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: Types.CourseCategory, level: Types.CourseLevel, status: Types.CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type PublishCourseMutationVariables = Types.Exact<{
  courseId: Types.Scalars['String']['input'];
}>;


export type PublishCourseMutation = { __typename?: 'Mutation', publishCourse: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: Types.CourseCategory, level: Types.CourseLevel, status: Types.CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type ArchiveCourseMutationVariables = Types.Exact<{
  courseId: Types.Scalars['String']['input'];
}>;


export type ArchiveCourseMutation = { __typename?: 'Mutation', archiveCourse: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: Types.CourseCategory, level: Types.CourseLevel, status: Types.CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type DeleteCourseMutationVariables = Types.Exact<{
  courseId: Types.Scalars['String']['input'];
}>;


export type DeleteCourseMutation = { __typename?: 'Mutation', deleteCourse: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: Types.CourseCategory, level: Types.CourseLevel, status: Types.CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export type RestoreCourseMutationVariables = Types.Exact<{
  courseId: Types.Scalars['String']['input'];
}>;


export type RestoreCourseMutation = { __typename?: 'Mutation', restoreCourse: { __typename?: 'Course', id: string, slug: string, title: string, instructor: string, imageUrl?: string | null, description: string, category: Types.CourseCategory, level: Types.CourseLevel, status: Types.CourseStatus, price?: number | null, currency: string, isFree: boolean, durationMinutes?: number | null, lastUpdatedAt: string, requirements: Array<string>, learnings: Array<string>, rating: number, ratingCount: number, professionals: number, isFeatured: boolean, providerId?: string | null, createdAt: string, updatedAt: string, deletedAt?: string | null } };

export const CourseFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}
    `, {"fragmentName":"CourseFields"}) as unknown as TypedDocumentString<CourseFieldsFragment, unknown>;
export const CoursePageInfoFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment CoursePageInfoFields on CoursePageInfo {
  nextCursor
  hasNextPage
}
    `, {"fragmentName":"CoursePageInfoFields"}) as unknown as TypedDocumentString<CoursePageInfoFieldsFragment, unknown>;
export const CurriculumLessonFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment CurriculumLessonFields on CurriculumLesson {
  id
  type
  title
  order
  isPreview
  createdAt
  updatedAt
  sectionId
  description
  durationMinutes
}
    `, {"fragmentName":"CurriculumLessonFields"}) as unknown as TypedDocumentString<CurriculumLessonFieldsFragment, unknown>;
export const CurriculumSectionFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment CurriculumSectionFields on CurriculumSection {
  id
  title
  order
  courseId
  description
  lessons {
    ...CurriculumLessonFields
  }
  createdAt
  updatedAt
}
    fragment CurriculumLessonFields on CurriculumLesson {
  id
  type
  title
  order
  isPreview
  createdAt
  updatedAt
  sectionId
  description
  durationMinutes
}`, {"fragmentName":"CurriculumSectionFields"}) as unknown as TypedDocumentString<CurriculumSectionFieldsFragment, unknown>;
export const CoursesDocument = /*#__PURE__*/ new TypedDocumentString(`
    query Courses($filter: CourseFilterInput, $pagination: CoursePaginationInput, $sort: CourseSortInput) {
  courses(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...CourseFields
    }
    totalCount
    pageInfo {
      ...CoursePageInfoFields
    }
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}
fragment CoursePageInfoFields on CoursePageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<CoursesQuery, CoursesQueryVariables>;
export const CourseByIdDocument = /*#__PURE__*/ new TypedDocumentString(`
    query CourseById($courseId: String!) {
  courseById(courseId: $courseId) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<CourseByIdQuery, CourseByIdQueryVariables>;
export const CourseBySlugDocument = /*#__PURE__*/ new TypedDocumentString(`
    query CourseBySlug($slug: String!) {
  courseBySlug(slug: $slug) {
    ...CourseFields
    curriculumSections {
      ...CurriculumSectionFields
    }
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}
fragment CurriculumLessonFields on CurriculumLesson {
  id
  type
  title
  order
  isPreview
  createdAt
  updatedAt
  sectionId
  description
  durationMinutes
}
fragment CurriculumSectionFields on CurriculumSection {
  id
  title
  order
  courseId
  description
  lessons {
    ...CurriculumLessonFields
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<CourseBySlugQuery, CourseBySlugQueryVariables>;
export const FeaturedCoursesDocument = /*#__PURE__*/ new TypedDocumentString(`
    query FeaturedCourses($take: Int) {
  featuredCourses(take: $take) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<FeaturedCoursesQuery, FeaturedCoursesQueryVariables>;
export const MyProviderCoursesDocument = /*#__PURE__*/ new TypedDocumentString(`
    query MyProviderCourses($filter: CourseFilterInput, $pagination: CoursePaginationInput, $sort: CourseSortInput) {
  myProviderCourses(filter: $filter, pagination: $pagination, sort: $sort) {
    items {
      ...CourseFields
    }
    totalCount
    pageInfo {
      ...CoursePageInfoFields
    }
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}
fragment CoursePageInfoFields on CoursePageInfo {
  nextCursor
  hasNextPage
}`) as unknown as TypedDocumentString<MyProviderCoursesQuery, MyProviderCoursesQueryVariables>;
export const CreateCourseDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CreateCourse($input: CreateCourseInput!) {
  createCourse(input: $input) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<CreateCourseMutation, CreateCourseMutationVariables>;
export const UpdateCourseDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation UpdateCourse($input: UpdateCourseInput!) {
  updateCourse(input: $input) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<UpdateCourseMutation, UpdateCourseMutationVariables>;
export const PublishCourseDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation PublishCourse($courseId: String!) {
  publishCourse(courseId: $courseId) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<PublishCourseMutation, PublishCourseMutationVariables>;
export const ArchiveCourseDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ArchiveCourse($courseId: String!) {
  archiveCourse(courseId: $courseId) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<ArchiveCourseMutation, ArchiveCourseMutationVariables>;
export const DeleteCourseDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation DeleteCourse($courseId: String!) {
  deleteCourse(courseId: $courseId) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<DeleteCourseMutation, DeleteCourseMutationVariables>;
export const RestoreCourseDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation RestoreCourse($courseId: String!) {
  restoreCourse(courseId: $courseId) {
    ...CourseFields
  }
}
    fragment CourseFields on Course {
  id
  slug
  title
  instructor
  imageUrl
  description
  category
  level
  status
  price
  currency
  isFree
  durationMinutes
  lastUpdatedAt
  requirements
  learnings
  rating
  ratingCount
  professionals
  isFeatured
  providerId
  createdAt
  updatedAt
  deletedAt
}`) as unknown as TypedDocumentString<RestoreCourseMutation, RestoreCourseMutationVariables>;