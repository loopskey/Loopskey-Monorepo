import { PodcastCategory, PodcastStatus } from "@prisma/client";
import { PodcastSortDirection } from "@podcast/enums/gql-names.enum";
import { PodcastSortField } from "@podcast/enums/gql-names.enum";
import { registerEnumType } from "@nestjs/graphql";

registerEnumType(PodcastCategory, {
  name: "PodcastCategory",
});

registerEnumType(PodcastStatus, {
  name: "PodcastStatus",
});

registerEnumType(PodcastSortField, {
  name: "PodcastSortField",
});

registerEnumType(PodcastSortDirection, {
  name: "PodcastSortDirection",
});
