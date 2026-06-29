import { ContentInteractionGqlInputNames } from "@contentAction/enums/gql-names.enum";
import { IsBoolean, IsEnum, Max, Min } from "class-validator";
import { IsInt, IsOptional, IsString } from "class-validator";
import { Field, InputType, Int } from "@nestjs/graphql";
import { WishlistPriceFilter } from "@contentAction/enums/wishlist-register.enum";
import { WishlistSortBy } from "@contentAction/enums/wishlist-register.enum";
import { ContentType } from "@prisma/client";

@InputType(ContentInteractionGqlInputNames.MY_WISHLIST)
export class MyWishlistInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 9 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => ContentType, { nullable: true })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field(() => WishlistPriceFilter, { nullable: true })
  @IsOptional()
  @IsEnum(WishlistPriceFilter)
  price?: WishlistPriceFilter;

  @Field(() => WishlistSortBy, {
    nullable: true,
    defaultValue: WishlistSortBy.NEWEST,
  })
  @IsOptional()
  @IsEnum(WishlistSortBy)
  sortBy?: WishlistSortBy = WishlistSortBy.NEWEST;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  onlyWithRating?: boolean = false;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  onlyWithUrl?: boolean = false;
}
