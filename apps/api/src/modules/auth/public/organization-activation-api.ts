export const ORGANIZATION_ACTIVATION_API = Symbol(
  "ORGANIZATION_ACTIVATION_API",
);

export type IssueOrganizationActivationCommand = {
  readonly userId: string;
  readonly destination: string;
};

export type OrganizationActivationLink = {
  readonly activationUrl: string;
  readonly expiresInMinutes: number;
};

export interface OrganizationActivationApi {
  issueActivationLink(
    command: IssueOrganizationActivationCommand,
  ): Promise<OrganizationActivationLink>;
}
