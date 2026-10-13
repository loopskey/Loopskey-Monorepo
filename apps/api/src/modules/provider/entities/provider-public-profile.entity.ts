import { ProviderProfileGqlObjectNames } from "@provider/enums/public-profile-gql-names.enum";
import { ProviderProfileReviewState } from "@prisma/client";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { ProviderProfileStatus } from "@prisma/client";
import { ContentUrlNamespace } from "@prisma/client";

import "@provider/enums/public-profile-register.enum";

@ObjectType(ProviderProfileGqlObjectNames.LINK)
export class ProviderPublicProfileLinkEntity {
  @Field() url: string;
  @Field() label: string;
}

@ObjectType(ProviderProfileGqlObjectNames.ITEM)
export class ProviderPublicProfileItemEntity {
  @Field(() => ContentUrlNamespace) kind: ContentUrlNamespace;
  @Field() slug: string;
  @Field() title: string;
  @Field(() => String, { nullable: true }) summary: string | null;
  @Field(() => String, { nullable: true }) imageUrl: string | null;
  @Field(() => String, { nullable: true }) category: string | null;
}

@ObjectType(ProviderProfileGqlObjectNames.PUBLIC)
export class ProviderPublicProfileEntity {
  @Field() slug: string;
  @Field() updatedAt: Date;
  @Field() publishedAt: Date;
  @Field() biography: string;
  @Field() displayName: string;
  @Field() excludeFromIndex: boolean;
  @Field(() => String, { nullable: true }) logoPath: string | null;
  @Field(() => String, { nullable: true }) websiteUrl: string | null;
  @Field(() => [ProviderPublicProfileLinkEntity])
  links: ProviderPublicProfileLinkEntity[];
  @Field(() => [ProviderPublicProfileItemEntity])
  items: ProviderPublicProfileItemEntity[];
}

@ObjectType(ProviderProfileGqlObjectNames.BYLINE)
export class ProviderPublicBylineEntity {
  @Field() slug: string;
  @Field() displayName: string;
}

@ObjectType(ProviderProfileGqlObjectNames.OWN)
export class ProviderPublicProfileDraftEntity {
  @Field() slug: string;
  @Field() isLive: boolean;
  @Field(() => ID) id: string;
  @Field(() => Int) draftVersion: number;
  @Field(() => Date, { nullable: true }) reviewedAt: Date | null;
  @Field(() => ID, { nullable: true }) logoImageId: string | null;
  @Field(() => Date, { nullable: true }) publishedAt: Date | null;
  @Field(() => Date, { nullable: true }) submittedAt: Date | null;
  @Field(() => String, { nullable: true }) logoPath: string | null;
  @Field(() => String, { nullable: true }) biography: string | null;
  @Field(() => ProviderProfileStatus) status: ProviderProfileStatus;
  @Field(() => String, { nullable: true }) reviewNote: string | null;
  @Field(() => String, { nullable: true }) websiteUrl: string | null;
  @Field(() => String, { nullable: true }) displayName: string | null;
  @Field() hasUnpublishedChanges: boolean;
  @Field(() => [ProviderPublicProfileLinkEntity])
  links: ProviderPublicProfileLinkEntity[];
  @Field(() => ProviderProfileReviewState)
  reviewState: ProviderProfileReviewState;
}

@ObjectType(ProviderProfileGqlObjectNames.ADMIN)
export class AdminProviderPublicProfileEntity extends ProviderPublicProfileDraftEntity {
  @Field() excludeFromIndex: boolean;
  @Field(() => ID) providerId: string;
  @Field(() => Date, { nullable: true }) withdrawnAt: Date | null;
  @Field(() => String, { nullable: true }) providerName: string | null;
}
