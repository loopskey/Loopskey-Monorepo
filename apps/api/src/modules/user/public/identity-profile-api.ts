export const IDENTITY_PROFILE_API = Symbol("IDENTITY_PROFILE_API");

export type IdentityDisplayProjection = {
  readonly id: string;
  readonly email: string | null;
  readonly fullName: string | null;
};

export type IdentityRecipientProjection = {
  readonly id: string;
  readonly email: string | null;
  readonly fullName: string | null;
  readonly emailVerifiedAt: Date | null;
  readonly isActive: boolean;
};

export interface IdentityProfileApi {
  display(userId: string): Promise<IdentityDisplayProjection | null>;
  recipients(
    userIds: readonly string[],
  ): Promise<IdentityRecipientProjection[]>;
  renameUnclaimedUser(userId: string, fullName: string): Promise<boolean>;
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

  resolveAssociationMemberUser(command: {
    readonly email: string;
    readonly fullName: string;
    readonly atomicContext: object;
  }): Promise<{ readonly id: string; readonly linkedExisting: boolean }>;
}
