import { YouTubeCategory, YouTubeVideoStatus } from "@prisma/client";
import { YouTubeChannelSortDirection } from "@youtube/enums/youtube.enum";
import { YouTubeChannelSortField } from "@youtube/enums/youtube.enum";
import { YouTubeChannelStatus } from "@prisma/client";
import { registerEnumType } from "@nestjs/graphql";

registerEnumType(YouTubeCategory, {
  name: "YouTubeCategory",
});

registerEnumType(YouTubeChannelStatus, {
  name: "YouTubeChannelStatus",
});

registerEnumType(YouTubeVideoStatus, {
  name: "YouTubeVideoStatus",
});

registerEnumType(YouTubeChannelSortField, {
  name: "YouTubeChannelSortField",
});

registerEnumType(YouTubeChannelSortDirection, {
  name: "YouTubeChannelSortDirection",
});
