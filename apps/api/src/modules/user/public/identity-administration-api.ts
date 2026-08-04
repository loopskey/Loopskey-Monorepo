export const IDENTITY_ADMINISTRATION_API = Symbol(
  "IDENTITY_ADMINISTRATION_API",
);

export type IdentityDirectoryQuery = {
  readonly role?: string;
  readonly status?: string;
  readonly search?: string;
  readonly premiumOnly?: boolean;
  readonly cursor?: string;
  readonly take: number;
};

export interface IdentityAdministrationApi {
  profile(userId: string): Promise<object | null>;
  updateProfile(
    userId: string,
    input: {
      readonly fullName?: string;
      readonly email?: string;
      readonly avatarUrl?: string;
      readonly bio?: string;
    },
  ): Promise<object>;
  directory(query: IdentityDirectoryQuery): Promise<object>;
  updateStatus(userId: string, status: string): Promise<object | null>;
  growth(mode: "DAILY" | "MONTHLY"): Promise<readonly object[]>;
}
