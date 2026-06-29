import { baseApi } from "@/lib/rtk/baseApi";

import type * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/graphql/generated";

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    events: builder.query<
      TAPI.EventsQuery["events"],
      TAPI.EventsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.EventsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.EventsQuery) => response.events,
      providesTags: ["Events"],
    }),

    eventById: builder.query<
      TAPI.EventByIdQuery["eventById"],
      TAPI.EventByIdQueryVariables
    >({
      query: (variables) => ({
        document: API.EventByIdDocument,
        variables,
      }),
      transformResponse: (response: TAPI.EventByIdQuery) => response.eventById,
      providesTags: (_result, _error, arg) => [
        { type: "Events", id: arg.eventId },
      ],
    }),

    eventBySlug: builder.query<
      TAPI.EventBySlugQuery["eventBySlug"],
      TAPI.EventBySlugQueryVariables
    >({
      query: (variables) => ({
        document: API.EventBySlugDocument,
        variables,
      }),
      transformResponse: (response: TAPI.EventBySlugQuery) =>
        response.eventBySlug,
      providesTags: (_result, _error, arg) => [
        { type: "Events", id: arg.slug },
      ],
    }),

    upcomingEvents: builder.query<
      TAPI.UpcomingEventsQuery["upcomingEvents"],
      TAPI.UpcomingEventsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.UpcomingEventsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.UpcomingEventsQuery) =>
        response.upcomingEvents,
      providesTags: ["Events"],
    }),

    featuredEvents: builder.query<
      TAPI.FeaturedEventsQuery["featuredEvents"],
      TAPI.FeaturedEventsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.FeaturedEventsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.FeaturedEventsQuery) =>
        response.featuredEvents,
      providesTags: ["Events"],
    }),

    myProviderEvents: builder.query<
      TAPI.MyProviderEventsQuery["myProviderEvents"],
      TAPI.MyProviderEventsQueryVariables | void
    >({
      query: (variables) => ({
        document: API.MyProviderEventsDocument,
        variables: variables ?? {},
      }),
      transformResponse: (response: TAPI.MyProviderEventsQuery) =>
        response.myProviderEvents,
      providesTags: ["Events", "CurrentUser"],
    }),

    myRegisteredEvents: builder.query<
      TAPI.MyRegisteredEventsQuery["myRegisteredEvents"],
      void
    >({
      query: () => ({
        document: API.MyRegisteredEventsDocument,
      }),
      transformResponse: (response: TAPI.MyRegisteredEventsQuery) =>
        response.myRegisteredEvents,
      providesTags: ["EventRegistrations", "CurrentUser"],
    }),

    createEvent: builder.mutation<
      TAPI.CreateEventMutation["createEvent"],
      TAPI.CreateEventMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.CreateEventDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.CreateEventMutation) =>
        response.createEvent,
      invalidatesTags: ["Events"],
    }),

    updateEvent: builder.mutation<
      TAPI.UpdateEventMutation["updateEvent"],
      TAPI.UpdateEventMutationVariables["input"]
    >({
      query: (input) => ({
        document: API.UpdateEventDocument,
        variables: { input },
      }),
      transformResponse: (response: TAPI.UpdateEventMutation) =>
        response.updateEvent,
      invalidatesTags: ["Events"],
    }),

    registerEvent: builder.mutation<
      TAPI.RegisterEventMutation["registerEvent"],
      TAPI.RegisterEventMutationVariables["eventId"]
    >({
      query: (eventId) => ({
        document: API.RegisterEventDocument,
        variables: { eventId },
      }),
      transformResponse: (response: TAPI.RegisterEventMutation) =>
        response.registerEvent,
      invalidatesTags: ["Events", "EventRegistrations"],
    }),

    cancelEventRegistration: builder.mutation<
      TAPI.CancelEventRegistrationMutation["cancelEventRegistration"],
      TAPI.CancelEventRegistrationMutationVariables["eventId"]
    >({
      query: (eventId) => ({
        document: API.CancelEventRegistrationDocument,
        variables: { eventId },
      }),
      transformResponse: (response: TAPI.CancelEventRegistrationMutation) =>
        response.cancelEventRegistration,
      invalidatesTags: ["Events", "EventRegistrations"],
    }),

    publishEvent: builder.mutation<
      TAPI.PublishEventMutation["publishEvent"],
      TAPI.PublishEventMutationVariables["eventId"]
    >({
      query: (eventId) => ({
        document: API.PublishEventDocument,
        variables: { eventId },
      }),
      transformResponse: (response: TAPI.PublishEventMutation) =>
        response.publishEvent,
      invalidatesTags: ["Events"],
    }),

    archiveEvent: builder.mutation<
      TAPI.ArchiveEventMutation["archiveEvent"],
      TAPI.ArchiveEventMutationVariables["eventId"]
    >({
      query: (eventId) => ({
        document: API.ArchiveEventDocument,
        variables: { eventId },
      }),
      transformResponse: (response: TAPI.ArchiveEventMutation) =>
        response.archiveEvent,
      invalidatesTags: ["Events"],
    }),

    cancelEvent: builder.mutation<
      TAPI.CancelEventMutation["cancelEvent"],
      TAPI.CancelEventMutationVariables["eventId"]
    >({
      query: (eventId) => ({
        document: API.CancelEventDocument,
        variables: { eventId },
      }),
      transformResponse: (response: TAPI.CancelEventMutation) =>
        response.cancelEvent,
      invalidatesTags: ["Events"],
    }),

    deleteEvent: builder.mutation<
      TAPI.DeleteEventMutation["deleteEvent"],
      TAPI.DeleteEventMutationVariables["eventId"]
    >({
      query: (eventId) => ({
        document: API.DeleteEventDocument,
        variables: { eventId },
      }),
      transformResponse: (response: TAPI.DeleteEventMutation) =>
        response.deleteEvent,
      invalidatesTags: ["Events"],
    }),

    restoreEvent: builder.mutation<
      TAPI.RestoreEventMutation["restoreEvent"],
      TAPI.RestoreEventMutationVariables["eventId"]
    >({
      query: (eventId) => ({
        document: API.RestoreEventDocument,
        variables: { eventId },
      }),
      transformResponse: (response: TAPI.RestoreEventMutation) =>
        response.restoreEvent,
      invalidatesTags: ["Events"],
    }),
  }),
});

export const {
  useEventsQuery,
  useEventByIdQuery,
  useLazyEventsQuery,
  useEventBySlugQuery,
  useLazyEventByIdQuery,
  useUpcomingEventsQuery,
  useFeaturedEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useCancelEventMutation,
  useDeleteEventMutation,
  usePublishEventMutation,
  useLazyEventBySlugQuery,
  useArchiveEventMutation,
  useRestoreEventMutation,
  useMyProviderEventsQuery,
  useRegisterEventMutation,
  useLazyFeaturedEventsQuery,
  useLazyUpcomingEventsQuery,
  useMyRegisteredEventsQuery,
  useLazyMyProviderEventsQuery,
  useLazyMyRegisteredEventsQuery,
  useCancelEventRegistrationMutation,
} = eventApi;
