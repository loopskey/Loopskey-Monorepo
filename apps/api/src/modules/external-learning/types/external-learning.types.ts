import { Role } from "@prisma/client";

export type TExternalLearningUser = {
  id: string;
  role: Role;
};
