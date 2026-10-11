import { YouTubeChannelBySlugDocument } from "@/lib/graphql/operations/youtube";
import { PodcastBySlugDocument } from "@/lib/graphql/operations/podcast";
import { CourseBySlugDocument } from "@/lib/graphql/operations/course";
import { EventBySlugDocument } from "@/lib/graphql/operations/event";
import { AppLanguage } from "@/lib/graphql/base";
import { baseApi } from "@/lib/rtk/baseApi";

import type { SetContentIndexExclusionInput } from "@/lib/graphql/base";
import type { TContentSeoLookupInput } from "@/types/content-seo.types";
import type { TContentSeoSettings } from "@/types/content-seo.types";
import type { SaveContentSeoInput } from "@/lib/graphql/base";
import type { TContentIdentity } from "@/types/content-seo.types";
import type { TContentSeoKind } from "@/types/content-seo.types";

import * as API from "@/lib/graphql/operations/content-seo";

const SEO_DOCUMENTS = {
  course: {
    read: API.CourseSeoDocument,
    save: API.SaveCourseSeoDocument,
    exclude: API.SetCourseIndexExclusionDocument,
    idVariable: "courseId",
  },
  event: {
    read: API.EventSeoDocument,
    save: API.SaveEventSeoDocument,
    exclude: API.SetEventIndexExclusionDocument,
    idVariable: "eventId",
  },
  podcast: {
    read: API.PodcastSeoDocument,
    save: API.SavePodcastSeoDocument,
    exclude: API.SetPodcastIndexExclusionDocument,
    idVariable: "podcastId",
  },
  youtube: {
    read: API.YouTubeChannelSeoDocument,
    save: API.SaveYouTubeChannelSeoDocument,
    exclude: API.SetYouTubeChannelIndexExclusionDocument,
    idVariable: "channelId",
  },
} as const;

const SLUG_DOCUMENTS = {
  course: { document: CourseBySlugDocument, field: "courseBySlug" },
  event: { document: EventBySlugDocument, field: "eventBySlug" },
  podcast: { document: PodcastBySlugDocument, field: "podcastBySlug" },
  youtube: {
    document: YouTubeChannelBySlugDocument,
    field: "youtubeChannelBySlug",
  },
} as const;

const settingsOf = (response: Record<string, TContentSeoSettings>) =>
  Object.values(response)[0];

export type TContentSeoReadArg = { kind: TContentSeoKind; id: string };
export type TContentSeoSaveArg = {
  kind: TContentSeoKind;
  input: SaveContentSeoInput;
};
export type TContentSeoExclusionArg = {
  kind: TContentSeoKind;
  input: SetContentIndexExclusionInput;
};

export const contentSeoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    contentSeo: builder.query<TContentSeoSettings, TContentSeoReadArg>({
      query: ({ kind, id }) => ({
        document: SEO_DOCUMENTS[kind].read,
        variables: { [SEO_DOCUMENTS[kind].idVariable]: id },
      }),
      transformResponse: settingsOf,
    }),

    saveContentSeo: builder.mutation<TContentSeoSettings, TContentSeoSaveArg>({
      query: ({ kind, input }) => ({
        document: SEO_DOCUMENTS[kind].save,
        variables: { input },
      }),
      transformResponse: settingsOf,
    }),

    setContentIndexExclusion: builder.mutation<
      TContentSeoSettings,
      TContentSeoExclusionArg
    >({
      query: ({ kind, input }) => ({
        document: SEO_DOCUMENTS[kind].exclude,
        variables: { input },
      }),
      transformResponse: settingsOf,
    }),

    contentIdentity: builder.query<TContentIdentity, TContentSeoLookupInput>({
      query: ({ kind, slug }) => ({
        document: SLUG_DOCUMENTS[kind].document,
        variables: { slug, locale: AppLanguage.En },
      }),
      transformResponse: (
        response: Record<string, TContentIdentity | null>,
      ) => {
        const identity = Object.values(response)[0];
        if (!identity) throw new Error("CONTENT_NOT_FOUND");
        return {
          id: identity.id,
          slug: identity.slug,
          title: identity.title,
          excludeFromIndex: Boolean(identity.excludeFromIndex),
        };
      },
    }),
  }),
});

export const {
  useContentSeoQuery,
  useSaveContentSeoMutation,
  useSetContentIndexExclusionMutation,
  useLazyContentIdentityQuery,
} = contentSeoApi;
