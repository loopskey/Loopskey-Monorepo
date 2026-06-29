import { ContentInteractionGqlObjectNames } from "@contentAction/enums/gql-names.enum";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { CartItemEntity } from "@contentAction/entities/cart-item.entity";
import { CartStatus } from "@prisma/client";

@ObjectType(ContentInteractionGqlObjectNames.CART)
export class CartEntity {
  @Field() userId: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
  @Field(() => ID) id: string;
  @Field(() => CartStatus) status: CartStatus;
  @Field(() => [CartItemEntity]) items: CartItemEntity[];
}
