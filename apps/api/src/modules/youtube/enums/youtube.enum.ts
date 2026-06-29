import { Role } from "@prisma/client";

export enum YouTubeChannelSortField {
  TITLE = "title",
  VIEWS = "views",
  UPDATED_AT = "updatedAt",
  CREATED_AT = "createdAt",
  VIDEO_COUNT = "videoCount",
  SUBSCRIBERS = "subscribers",
}

export enum YouTubeChannelSortDirection {
  ASC = "asc",
  DESC = "desc",
}

export type YouTubeRequester = {
  id: string;
  role: Role;
};
