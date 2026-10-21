import { Prisma } from "@prisma/client";

export type TActivityWrite = Omit<
  Prisma.PDUActivityUncheckedCreateInput,
  "userId"
>;

export type TContentLinkCheck = {
  mustExist: boolean;
  learningContentId: string;
  requirementId: string | null | undefined;
};
