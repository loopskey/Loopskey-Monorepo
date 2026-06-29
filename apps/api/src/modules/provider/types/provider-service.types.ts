import { Role } from "@prisma/client";

export type TCurrentUser = { id?: string; sub?: string; role: Role };
