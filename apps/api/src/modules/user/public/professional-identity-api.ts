export const PROFESSIONAL_IDENTITY_API = Symbol("PROFESSIONAL_IDENTITY_API");

export type ProfessionalIdentityProjection = {
  id: string;
  bio: string | null;
  role: string;
  email: string | null;
  phone: string | null;
  status: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  emailVerifiedAt: Date | null;
};

export interface ProfessionalIdentityApi {
  profile(userId: string): Promise<ProfessionalIdentityProjection | null>;
  update(
    userId: string,
    data: { fullName?: string; bio?: string | null; phone?: string | null },
    atomicContext?: object,
  ): Promise<void>;
  avatar(userId: string): Promise<{ avatarStorageKey: string | null } | null>;
  setAvatar(
    userId: string,
    value: { avatarStorageKey: string | null; avatarUrl: string | null },
  ): Promise<{ id: string; avatarUrl: string | null }>;
  avatarOwner(storageKey: string): Promise<boolean>;
  activeSessions(userId: string): Promise<readonly Record<string, unknown>[]>;
}
