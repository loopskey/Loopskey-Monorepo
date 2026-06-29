import { ContentInteractionGqlObjectNames } from "@contentAction/enums/gql-names.enum";
import { Field, Float, ID, ObjectType } from "@nestjs/graphql";
import { CartItemStatus, ContentType } from "@prisma/client";

@ObjectType(ContentInteractionGqlObjectNames.CART_ITEM)
export class CartItemEntity {
  @Field() cartId: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field() currency: string;
  @Field() contentId: string;
  @Field(() => ID) id: string;
  @Field() titleSnapshot: string;
  @Field(() => Float) priceSnapshot: number;
  @Field(() => ContentType) contentType: ContentType;
  @Field(() => CartItemStatus) status: CartItemStatus;
}
