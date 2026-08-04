export const PROFESSIONAL_PROVISIONING_API = Symbol(
  "PROFESSIONAL_PROVISIONING_API",
);

export interface ProfessionalProvisioningApi {
  ensureProfile(userId: string, atomicContext?: object): Promise<void>;
}
