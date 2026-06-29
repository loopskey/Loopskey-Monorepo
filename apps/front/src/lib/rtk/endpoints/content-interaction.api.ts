import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

export const contentInteractionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    myEnrollments: builder.query<
      TAPI.MyEnrollmentsQuery["myEnrollments"],
      void
    >({
      query: () => ({
        document: API.MyEnrollmentsDocument,
      }),
      transformResponse: (response: TAPI.MyEnrollmentsQuery) =>
        response.myEnrollments,
      providesTags: ["Enrollments", "CurrentUser"],
    }),

    myCart: builder.query<TAPI.MyCartQuery["myCart"], void>({
      query: () => ({
        document: API.MyCartDocument,
      }),
      transformResponse: (response: TAPI.MyCartQuery) => response.myCart,
      providesTags: ["Cart", "CurrentUser"],
    }),

    contentReviews: builder.query<
      TAPI.ContentReviewsQuery["contentReviews"],
      TAPI.ContentReviewsQueryVariables
    >({
      query: (variables) => ({
        document: API.ContentReviewsDocument,
        variables,
      }),
      transformResponse: (response: TAPI.ContentReviewsQuery) =>
        response.contentReviews,
      providesTags: (_result, _error, arg) => [
        "Reviews",
        {
          type: "Reviews",
          id: `${arg.contentType}-${arg.contentId}`,
        },
      ],
    }),

    myReviewForContent: builder.query<
      TAPI.MyReviewForContentQuery["myReviewForContent"],
      TAPI.MyReviewForContentQueryVariables
    >({
      query: (variables) => ({
        document: API.MyReviewForContentDocument,
        variables,
      }),
      transformResponse: (response: TAPI.MyReviewForContentQuery) =>
        response.myReviewForContent,
      providesTags: (_result, _error, arg) => [
        "Reviews",
        "CurrentUser",
        {
          type: "Reviews",
          id: `MY-${arg.contentType}-${arg.contentId}`,
        },
      ],
    }),

    myWishlist: builder.query<
      TAPI.MyWishlistQuery["myWishlist"],
      TAPI.MyWishlistQueryVariables["input"] | void
    >({
      query: (input) => ({
        document: API.MyWishlistDocument,
        variables: {
          input: input ?? undefined,
        },
      }),
      transformResponse: (response: TAPI.MyWishlistQuery) =>
        response.myWishlist,
      providesTags: ["Wishlist", "CurrentUser"],
    }),

    toggleWishlist: builder.mutation<
      TAPI.ToggleWishlistMutation["toggleWishlist"],
      TAPI.ToggleWishlistMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.ToggleWishlistDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.ToggleWishlistMutation) =>
        response.toggleWishlist,
      invalidatesTags: (_result, _error, arg) => [
        "Wishlist",
        "ContentInteraction",
        {
          type: "Wishlist",
          id: `${arg.contentType}-${arg.contentId}`,
        },
      ],
    }),

    enrollContent: builder.mutation<
      TAPI.EnrollContentMutation["enrollContent"],
      TAPI.EnrollContentMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.EnrollContentDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.EnrollContentMutation) =>
        response.enrollContent,
      invalidatesTags: (_result, _error, arg) => [
        "Enrollments",
        "ContentInteraction",
        "EventRegistrations",
        {
          type: "Enrollments",
          id: `${arg.contentType}-${arg.contentId}`,
        },
      ],
    }),

    cancelContentEnrollment: builder.mutation<
      TAPI.CancelContentEnrollmentMutation["cancelContentEnrollment"],
      TAPI.CancelContentEnrollmentMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CancelContentEnrollmentDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.CancelContentEnrollmentMutation) =>
        response.cancelContentEnrollment,
      invalidatesTags: (_result, _error, arg) => [
        "Enrollments",
        "ContentInteraction",
        "EventRegistrations",
        {
          type: "Enrollments",
          id: `${arg.contentType}-${arg.contentId}`,
        },
      ],
    }),

    updateEnrollmentProgress: builder.mutation<
      TAPI.UpdateEnrollmentProgressMutation["updateEnrollmentProgress"],
      TAPI.UpdateEnrollmentProgressMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateEnrollmentProgressDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateEnrollmentProgressMutation) =>
        response.updateEnrollmentProgress,
      invalidatesTags: (_result, _error, arg) => [
        "Enrollments",
        "ContentInteraction",
        {
          type: "Enrollments",
          id: `${arg.contentType}-${arg.contentId}`,
        },
      ],
    }),

    submitContentReview: builder.mutation<
      TAPI.SubmitContentReviewMutation["submitContentReview"],
      TAPI.SubmitContentReviewMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.SubmitContentReviewDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.SubmitContentReviewMutation) =>
        response.submitContentReview,
      invalidatesTags: (_result, _error, arg) => [
        "Reviews",
        "ContentInteraction",
        {
          type: "Reviews",
          id: `${arg.contentType}-${arg.contentId}`,
        },
        {
          type: "Reviews",
          id: `MY-${arg.contentType}-${arg.contentId}`,
        },
        ...getContentListTags(arg.contentType),
      ],
    }),

    deleteContentReview: builder.mutation<
      TAPI.DeleteContentReviewMutation["deleteContentReview"],
      TAPI.DeleteContentReviewMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.DeleteContentReviewDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.DeleteContentReviewMutation) =>
        response.deleteContentReview,
      invalidatesTags: (_result, _error, arg) => [
        "Reviews",
        "ContentInteraction",
        {
          type: "Reviews",
          id: `${arg.contentType}-${arg.contentId}`,
        },
        {
          type: "Reviews",
          id: `MY-${arg.contentType}-${arg.contentId}`,
        },
        ...getContentListTags(arg.contentType),
      ],
    }),

    addToCart: builder.mutation<
      TAPI.AddToCartMutation["addToCart"],
      TAPI.AddToCartMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.AddToCartDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.AddToCartMutation) =>
        response.addToCart,
      invalidatesTags: (_result, _error, arg) => [
        "Cart",
        "ContentInteraction",
        {
          type: "Cart",
          id: `${arg.contentType}-${arg.contentId}`,
        },
      ],
    }),

    removeFromCart: builder.mutation<
      TAPI.RemoveFromCartMutation["removeFromCart"],
      TAPI.RemoveFromCartMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.RemoveFromCartDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.RemoveFromCartMutation) =>
        response.removeFromCart,
      invalidatesTags: (_result, _error, arg) => [
        "Cart",
        "ContentInteraction",
        {
          type: "Cart",
          id: `${arg.contentType}-${arg.contentId}`,
        },
      ],
    }),

    clearCart: builder.mutation<TAPI.ClearCartMutation["clearCart"], void>({
      query: () => ({
        document: API.ClearCartDocument,
      }),
      transformResponse: (response: TAPI.ClearCartMutation) =>
        response.clearCart,
      invalidatesTags: ["Cart", "ContentInteraction"],
    }),
  }),
});

const getContentListTags = (contentType: API.ContentType) => {
  if (contentType === API.ContentType.Course) return ["Courses"] as const;
  if (contentType === API.ContentType.Event) return ["Events"] as const;
  if (contentType === API.ContentType.Podcast) return ["Podcasts"] as const;
  if (contentType === API.ContentType.Youtube)
    return ["YouTubeChannels"] as const;
  return [] as const;
};

export const {
  useMyCartQuery,
  useLazyMyCartQuery,
  useMyWishlistQuery,
  useClearCartMutation,
  useAddToCartMutation,
  useMyEnrollmentsQuery,
  useContentReviewsQuery,
  useLazyMyWishlistQuery,
  useEnrollContentMutation,
  useRemoveFromCartMutation,
  useLazyMyEnrollmentsQuery,
  useToggleWishlistMutation,
  useLazyContentReviewsQuery,
  useMyReviewForContentQuery,
  useDeleteContentReviewMutation,
  useSubmitContentReviewMutation,
  useLazyMyReviewForContentQuery,
  useCancelContentEnrollmentMutation,
  useUpdateEnrollmentProgressMutation,
} = contentInteractionApi;
