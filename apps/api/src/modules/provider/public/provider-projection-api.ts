export const PROVIDER_PROJECTION_API = Symbol("PROVIDER_PROJECTION_API");

export interface ProviderProjectionApi {
  names(providerIds: string[]): Promise<Record<string, string | null>>;
}
