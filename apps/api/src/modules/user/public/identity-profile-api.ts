export const IDENTITY_PROFILE_API = Symbol("IDENTITY_PROFILE_API");

export type IdentityDisplayProjection = {
  readonly id: string;
  readonly email: string | null;
  readonly fullName: string | null;
};

export interface IdentityProfileApi {
  display(userId: string): Promise<IdentityDisplayProjection | null>;
  existsByEmail(email: string): Promise<boolean>;
  upsertProfessionalMember(command: {
    readonly email: string;
    readonly fullName: string;
    readonly atomicContext?: object;
  }): Promise<{ readonly id: string }>;
  updateRole(
    userId: string,
    role: string,
    atomicContext?: object,
  ): Promise<void>;
  resolveOrganizationOwner(command: {
    readonly email: string;
    readonly fullName: string;
    readonly atomicContext: object;
  }): Promise<{ readonly id: string; readonly linkedExisting: boolean }>;

  createPendingAssociationOwner(command: {
    readonly email: string;
    readonly fullName: string;
    readonly atomicContext: object;
  }): Promise<{ readonly id: string }>;
}
