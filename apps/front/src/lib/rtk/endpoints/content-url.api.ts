import { ChangeContentSlugDocument } from "@/lib/graphql/operations/content-url";
import { ContentUrlDocument } from "@/lib/graphql/operations/content-url";
import { ContentUrlKind } from "@/lib/graphql/base";
import { baseApi } from "@/lib/rtk/baseApi";

import type { TContentUrlChangeArg } from "@/types/content-url.types";
import type { TContentUrlReadArg } from "@/types/content-url.types";
import type { TContentUrlSettings } from "@/types/content-url.types";
import type { PublicPageKind } from "@/lib/content-catalog/public-path";

const URL_KIND: Record<PublicPageKind, ContentUrlKind> = {
  course: ContentUrlKind.Course,
  event: ContentUrlKind.Event,
  podcast: ContentUrlKind.Podcast,
  youtube: ContentUrlKind.Youtube,
  topic: ContentUrlKind.Topic,
  provider: ContentUrlKind.Provider,
};

export const contentUrlApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    contentUrl: builder.query<TContentUrlSettings, TContentUrlReadArg>({
      query: ({ kind, contentId }) => ({
        document: ContentUrlDocument,
        variables: { kind: URL_KIND[kind], contentId },
      }),
      transformResponse: (response: { contentUrl: TContentUrlSettings }) =>
        response.contentUrl,
    }),

    changeContentSlug: builder.mutation<
      TContentUrlSettings,
      TContentUrlChangeArg
    >({
      query: ({ kind, contentId, slug, expectedSlug }) => ({
        document: ChangeContentSlugDocument,
        variables: {
          input: { kind: URL_KIND[kind], contentId, slug, expectedSlug },
        },
      }),
      transformResponse: (response: {
        changeContentSlug: TContentUrlSettings;
      }) => response.changeContentSlug,
      invalidatesTags: ["Courses", "Events", "Podcasts", "YouTubeChannels"],
    }),
  }),
});

export const { useContentUrlQuery, useChangeContentSlugMutation } =
  contentUrlApi;
