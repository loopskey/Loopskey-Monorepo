export const CONTENT_SOCIAL_IMAGE_API = Symbol("CONTENT_SOCIAL_IMAGE_API");

export interface ContentSocialImageApi {
  isOwnedBy(imageId: string, ownerId: string): Promise<boolean>;
  retireAll(imageIds: readonly (string | null | undefined)[]): Promise<void>;
}
