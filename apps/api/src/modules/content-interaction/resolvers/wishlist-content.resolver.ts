import { PaginatedWishlistEntity } from "@contentAction/entities/wishlist.entity";
import { WishlistContentService } from "@contentAction/services/wishlist-content.service";
import { Args, Query, Resolver } from "@nestjs/graphql";
import { MyWishlistInput } from "@contentAction/dtos/my-wishlist.input";
import { TCurrentUser } from "@modules/provider/types/provider-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.PROFESSIONAL, Role.PROVIDER, Role.ORGANIZATION, Role.ADMIN)
export class WishlistContentResolver {
  constructor(
    private readonly wishlistContentService: WishlistContentService,
  ) {}

  private getUserId(user: TCurrentUser): string {
    return user.id ?? user.sub!;
  }

  @Query(() => PaginatedWishlistEntity, {
    name: "myWishlist",
  })
  myWishlist(
    @CurrentUser() user: TCurrentUser,
    @Args("input", { nullable: true }) input?: MyWishlistInput,
  ) {
    return this.wishlistContentService.myWishlist(this.getUserId(user), input);
  }
}
