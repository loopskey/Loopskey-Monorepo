import { ContentInteractionGqlObjectNames } from "@contentAction/enums/gql-names.enum";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { WishlistContentEntity } from "@contentAction/entities/wishlist-content.entity";
import { ContentType } from "@prisma/client";

@ObjectType(ContentInteractionGqlObjectNames.WISHLIST_ITEM)
export class WishlistItemEntity {
  @Field(() => ID) id: string;
  @Field(() => ID) userId: string;
  @Field(() => Date) createdAt: Date;
  @Field(() => String) contentId: string;
  @Field(() => ContentType) contentType: ContentType;
  @Field(() => WishlistContentEntity, { nullable: true })
  content?: WishlistContentEntity | null;
}
