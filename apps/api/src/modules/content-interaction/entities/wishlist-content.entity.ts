import { Field, Float, ObjectType } from "@nestjs/graphql";

@ObjectType("WishlistContent")
export class WishlistContentEntity {
  @Field(() => Boolean) isFree: boolean;
  @Field(() => String, { nullable: true }) url?: string | null;
  @Field(() => String, { nullable: true }) slug?: string | null;
  @Field(() => Float, { nullable: true }) price?: number | null;
  @Field(() => String, { nullable: true }) title?: string | null;
  @Field(() => Float, { nullable: true }) rating?: number | null;
  @Field(() => String, { nullable: true }) currency?: string | null;
  @Field(() => String, { nullable: true }) imageUrl?: string | null;
  @Field(() => String, { nullable: true }) category?: string | null;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => String, { nullable: true }) providerName?: string | null;
}
