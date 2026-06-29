import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

export const courseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    courses: builder.query<
      TAPI.CoursesQuery["courses"],
      TAPI.CoursesQueryVariables | void
    >({
      query: (variables) => ({
        document: API.CoursesDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.CoursesQuery) => response.courses,
      providesTags: ["Courses"],
    }),

    courseById: builder.query<
      TAPI.CourseByIdQuery["courseById"],
      TAPI.CourseByIdQueryVariables
    >({
      query: (variables) => ({
        document: API.CourseByIdDocument,
        variables,
      }),
      transformResponse: (response: TAPI.CourseByIdQuery) =>
        response.courseById,
      providesTags: (_result, _error, arg) => [
        { type: "Courses", id: arg.courseId },
      ],
    }),

    courseBySlug: builder.query<
      TAPI.CourseBySlugQuery["courseBySlug"],
      TAPI.CourseBySlugQueryVariables
    >({
      query: (variables) => ({
        document: API.CourseBySlugDocument,
        variables,
      }),
      transformResponse: (response: TAPI.CourseBySlugQuery) =>
        response.courseBySlug,
      providesTags: (_result, _error, arg) => [
        { type: "Courses", id: arg.slug },
      ],
    }),

    featuredCourses: builder.query<
      TAPI.FeaturedCoursesQuery["featuredCourses"],
      TAPI.FeaturedCoursesQueryVariables | void
    >({
      query: (variables) => ({
        document: API.FeaturedCoursesDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.FeaturedCoursesQuery) =>
        response.featuredCourses,
      providesTags: ["Courses"],
    }),

    myProviderCourses: builder.query<
      TAPI.MyProviderCoursesQuery["myProviderCourses"],
      TAPI.MyProviderCoursesQueryVariables | void
    >({
      query: (variables) => ({
        document: API.MyProviderCoursesDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.MyProviderCoursesQuery) =>
        response.myProviderCourses,
      providesTags: ["Courses", "CurrentUser"],
    }),

    createCourse: builder.mutation<
      TAPI.CreateCourseMutation["createCourse"],
      TAPI.CreateCourseMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateCourseDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.CreateCourseMutation) =>
        response.createCourse,
      invalidatesTags: ["Courses"],
    }),

    updateCourse: builder.mutation<
      TAPI.UpdateCourseMutation["updateCourse"],
      TAPI.UpdateCourseMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateCourseDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateCourseMutation) =>
        response.updateCourse,
      invalidatesTags: ["Courses"],
    }),

    publishCourse: builder.mutation<
      TAPI.PublishCourseMutation["publishCourse"],
      TAPI.PublishCourseMutationVariables["courseId"]
    >({
      query: (courseId) => ({
        document: API.PublishCourseDocument,
        variables: { courseId },
      }),
      transformResponse: (response: TAPI.PublishCourseMutation) =>
        response.publishCourse,
      invalidatesTags: ["Courses"],
    }),

    archiveCourse: builder.mutation<
      TAPI.ArchiveCourseMutation["archiveCourse"],
      TAPI.ArchiveCourseMutationVariables["courseId"]
    >({
      query: (courseId) => ({
        document: API.ArchiveCourseDocument,
        variables: { courseId },
      }),
      transformResponse: (response: TAPI.ArchiveCourseMutation) =>
        response.archiveCourse,
      invalidatesTags: ["Courses"],
    }),

    deleteCourse: builder.mutation<
      TAPI.DeleteCourseMutation["deleteCourse"],
      TAPI.DeleteCourseMutationVariables["courseId"]
    >({
      query: (courseId) => ({
        document: API.DeleteCourseDocument,
        variables: { courseId },
      }),
      transformResponse: (response: TAPI.DeleteCourseMutation) =>
        response.deleteCourse,
      invalidatesTags: ["Courses"],
    }),

    restoreCourse: builder.mutation<
      TAPI.RestoreCourseMutation["restoreCourse"],
      TAPI.RestoreCourseMutationVariables["courseId"]
    >({
      query: (courseId) => ({
        document: API.RestoreCourseDocument,
        variables: { courseId },
      }),
      transformResponse: (response: TAPI.RestoreCourseMutation) =>
        response.restoreCourse,
      invalidatesTags: ["Courses"],
    }),
  }),
});

export const {
  useCoursesQuery,
  useCourseByIdQuery,
  useLazyCoursesQuery,
  useCourseBySlugQuery,
  useLazyCourseByIdQuery,
  useLazyCourseBySlugQuery,
  useFeaturedCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useRestoreCourseMutation,
  usePublishCourseMutation,
  useArchiveCourseMutation,
  useMyProviderCoursesQuery,
  useLazyFeaturedCoursesQuery,
  useLazyMyProviderCoursesQuery,
} = courseApi;
