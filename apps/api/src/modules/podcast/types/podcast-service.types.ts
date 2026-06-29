import { Role } from "@prisma/client";

export type TCurrentUserPayload = {
  id?: string;
  sub?: string;
  role: Role;
};

export type PodcastRequester = {
  id: string;
  role: Role;
};
