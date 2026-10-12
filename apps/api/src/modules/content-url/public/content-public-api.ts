export const CONTENT_PUBLIC_API = Symbol("CONTENT_PUBLIC_API");

export type PublicContentKind = "COURSE" | "EVENT" | "PODCAST" | "YOUTUBE";

export type PublicContentRef = {
  readonly kind: PublicContentKind;
  readonly id: string;
};

export type PublicContentCard = {
  readonly kind: PublicContentKind;
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string | null;
  readonly imageUrl: string | null;
  readonly category: string | null;
};

export interface ContentPublicApi {
  findPublished(
    refs: readonly PublicContentRef[],
  ): Promise<PublicContentCard[]>;
  findPublishedProviderId(ref: PublicContentRef): Promise<string | null>;
  findPublishedByProvider(
    providerId: string,
    take: number,
  ): Promise<PublicContentCard[]>;
}
