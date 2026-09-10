import { Role } from "@prisma/client";

export type TResolverUser = { id?: string; sub?: string; role: Role };

export type TIngestionAdminActor = { id: string; role: Role };
