export enum ContentInteractionGqlObjectNames {
  CART = "Cart",
  CART_ITEM = "CartItem",
  WISHLIST_ITEM = "WishlistItem",
  CONTENT_REVIEW = "ContentReview",
  WISHLIST_CONTENT = "WishlistContent",
  PAGINATED_WISHLIST = "PaginatedWishlist",
  CONTENT_ENROLLMENT = "ContentEnrollment",
  CONTENT_ACTION_PAYLOAD = "ContentActionPayload",
}

export enum ContentInteractionGqlInputNames {
  MY_WISHLIST = "MyWishlistInput",
  CONTENT_ACTION = "ContentActionInput",
  SUBMIT_CONTENT_REVIEW = "SubmitContentReviewInput",
  UPDATE_ENROLLMENT_PROGRESS = "UpdateEnrollmentProgressInput",
}

export enum ContentInteractionGqlQueryNames {
  MY_CART = "myCart",
  MY_WISHLIST = "myWishlist",
  MY_ENROLLMENTS = "myEnrollments",
  CONTENT_REVIEWS = "contentReviews",
  MY_REVIEW_FOR_CONTENT = "myReviewForContent",
  CONTENT_INTERACTION_STATUS = "contentInteractionStatus",
}

export enum ContentInteractionGqlMutationNames {
  CLEAR_CART = "clearCart",
  ADD_TO_CART = "addToCart",
  ENROLL_CONTENT = "enrollContent",
  TOGGLE_WISHLIST = "toggleWishlist",
  REMOVE_FROM_CART = "removeFromCart",
  DELETE_CONTENT_REVIEW = "deleteContentReview",
  SUBMIT_CONTENT_REVIEW = "submitContentReview",
  CANCEL_CONTENT_ENROLLMENT = "cancelContentEnrollment",
  UPDATE_ENROLLMENT_PROGRESS = "updateEnrollmentProgress",
}
