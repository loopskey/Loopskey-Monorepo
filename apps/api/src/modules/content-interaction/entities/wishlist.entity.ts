import { ContentInteractionGqlObjectNames } from "@contentAction/enums/gql-names.enum";
import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { ContentType } from "@prisma/client";

@ObjectType(ContentInteractionGqlObjectNames.WISHLIST_CONTENT)
export class WishlistContentEntity {
  @Field(() => Boolean) isFree!: boolean;
  @Field(() => String, { nullable: true }) url?: string | null;
  @Field(() => Float, { nullable: true }) price?: number | null;
  @Field(() => String, { nullable: true }) slug?: string | null;
  @Field(() => String, { nullable: true }) title?: string | null;
  @Field(() => Float, { nullable: true }) rating?: number | null;
  @Field(() => String, { nullable: true }) imageUrl?: string | null;
  @Field(() => String, { nullable: true }) category?: string | null;
  @Field(() => String, { nullable: true }) currency?: string | null;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => String, { nullable: true }) providerName?: string | null;
}

@ObjectType(ContentInteractionGqlObjectNames.WISHLIST_ITEM)
export class WishlistItemEntity {
  @Field(() => String) id!: string;
  @Field(() => Date) createdAt!: Date;
  @Field(() => String) userId!: string;
  @Field(() => String) contentId!: string;
  @Field(() => ContentType) contentType!: ContentType;
  @Field(() => WishlistContentEntity, { nullable: true })
  content?: WishlistContentEntity | null;
}

@ObjectType(ContentInteractionGqlObjectNames.PAGINATED_WISHLIST)
export class PaginatedWishlistEntity {
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
  @Field(() => Int) totalCount!: number;
  @Field(() => Int) totalPages!: number;
  @Field(() => Boolean) hasNextPage!: boolean;
  @Field(() => [String]) categories!: string[];
  @Field(() => Boolean) hasPreviousPage!: boolean;
  @Field(() => [WishlistItemEntity]) items!: WishlistItemEntity[];
}
