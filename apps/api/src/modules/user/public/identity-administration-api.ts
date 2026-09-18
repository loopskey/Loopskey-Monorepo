export const IDENTITY_ADMINISTRATION_API = Symbol(
  "IDENTITY_ADMINISTRATION_API",
);

export type IdentityDirectoryQuery = {
  readonly take: number;
  readonly role?: string;
  readonly status?: string;
  readonly cursor?: string;
  readonly search?: string;
  readonly premiumOnly?: boolean;
};

export interface IdentityAdministrationApi {
  profile(userId: string): Promise<object | null>;
  updateProfile(
    userId: string,
    input: {
      readonly bio?: string;
      readonly email?: string;
      readonly fullName?: string;
      readonly avatarUrl?: string;
    },
  ): Promise<object>;
  directory(query: IdentityDirectoryQuery): Promise<object>;
  updateStatus(userId: string, status: string): Promise<object | null>;
  deleteUser(userId: string): Promise<{
    readonly id: string;
    readonly role: string;
    readonly email: string | null;
  } | null>;
  growth(mode: "DAILY" | "MONTHLY"): Promise<readonly object[]>;
}
