import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type ContentActionPayloadFieldsFragment = { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null };

export type WishlistContentFieldsFragment = { __typename?: 'WishlistContent', url?: string | null, slug?: string | null, title?: string | null, price?: number | null, isFree: boolean, rating?: number | null, imageUrl?: string | null, category?: string | null, currency?: string | null, description?: string | null, providerName?: string | null };

export type WishlistItemFieldsFragment = { __typename?: 'WishlistItem', id: string, userId: string, contentId: string, createdAt: string, contentType: Types.ContentType, content?: { __typename?: 'WishlistContent', url?: string | null, slug?: string | null, title?: string | null, price?: number | null, isFree: boolean, rating?: number | null, imageUrl?: string | null, category?: string | null, currency?: string | null, description?: string | null, providerName?: string | null } | null };

export type MyWishlistQueryVariables = Types.Exact<{
  input?: Types.InputMaybe<Types.MyWishlistInput>;
}>;


export type MyWishlistQuery = { __typename?: 'Query', myWishlist: { __typename?: 'PaginatedWishlist', page: number, limit: number, totalCount: number, categories: Array<string>, totalPages: number, hasNextPage: boolean, hasPreviousPage: boolean, items: Array<{ __typename?: 'WishlistItem', id: string, userId: string, contentId: string, createdAt: string, contentType: Types.ContentType, content?: { __typename?: 'WishlistContent', url?: string | null, slug?: string | null, title?: string | null, price?: number | null, isFree: boolean, rating?: number | null, imageUrl?: string | null, category?: string | null, currency?: string | null, description?: string | null, providerName?: string | null } | null }> } };

export type ToggleWishlistMutationVariables = Types.Exact<{
  input: Types.ContentActionInput;
}>;


export type ToggleWishlistMutation = { __typename?: 'Mutation', toggleWishlist: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export type ContentEnrollmentFieldsFragment = { __typename?: 'ContentEnrollment', id: string, userId: string, status: Types.ContentEnrollmentStatus, progress: number, contentId: string, createdAt: string, startedAt: string, updatedAt: string, canceledAt?: string | null, contentType: Types.ContentType, completedAt?: string | null };

export type ContentReviewFieldsFragment = { __typename?: 'ContentReview', id: string, userId: string, rating: number, comment?: string | null, createdAt: string, updatedAt: string, contentId: string, contentType: Types.ContentType };

export type CartItemFieldsFragment = { __typename?: 'CartItem', id: string, cartId: string, status: Types.CartItemStatus, currency: string, createdAt: string, updatedAt: string, contentId: string, contentType: Types.ContentType, titleSnapshot: string, priceSnapshot: number };

export type CartFieldsFragment = { __typename?: 'Cart', id: string, userId: string, status: Types.CartStatus, createdAt: string, updatedAt: string, items: Array<{ __typename?: 'CartItem', id: string, cartId: string, status: Types.CartItemStatus, currency: string, createdAt: string, updatedAt: string, contentId: string, contentType: Types.ContentType, titleSnapshot: string, priceSnapshot: number }> };

export type MyEnrollmentsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MyEnrollmentsQuery = { __typename?: 'Query', myEnrollments: Array<{ __typename?: 'ContentEnrollment', id: string, userId: string, status: Types.ContentEnrollmentStatus, progress: number, contentId: string, createdAt: string, startedAt: string, updatedAt: string, canceledAt?: string | null, contentType: Types.ContentType, completedAt?: string | null }> };

export type MyCartQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MyCartQuery = { __typename?: 'Query', myCart?: { __typename?: 'Cart', id: string, userId: string, status: Types.CartStatus, createdAt: string, updatedAt: string, items: Array<{ __typename?: 'CartItem', id: string, cartId: string, status: Types.CartItemStatus, currency: string, createdAt: string, updatedAt: string, contentId: string, contentType: Types.ContentType, titleSnapshot: string, priceSnapshot: number }> } | null };

export type ContentReviewsQueryVariables = Types.Exact<{
  contentType: Types.ContentType;
  contentId: Types.Scalars['String']['input'];
}>;


export type ContentReviewsQuery = { __typename?: 'Query', contentReviews: Array<{ __typename?: 'ContentReview', id: string, userId: string, rating: number, comment?: string | null, createdAt: string, updatedAt: string, contentId: string, contentType: Types.ContentType }> };

export type MyReviewForContentQueryVariables = Types.Exact<{
  contentType: Types.ContentType;
  contentId: Types.Scalars['String']['input'];
}>;


export type MyReviewForContentQuery = { __typename?: 'Query', myReviewForContent?: { __typename?: 'ContentReview', id: string, userId: string, rating: number, comment?: string | null, createdAt: string, updatedAt: string, contentId: string, contentType: Types.ContentType } | null };

export type EnrollContentMutationVariables = Types.Exact<{
  input: Types.ContentActionInput;
}>;


export type EnrollContentMutation = { __typename?: 'Mutation', enrollContent: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export type CancelContentEnrollmentMutationVariables = Types.Exact<{
  input: Types.ContentActionInput;
}>;


export type CancelContentEnrollmentMutation = { __typename?: 'Mutation', cancelContentEnrollment: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export type UpdateEnrollmentProgressMutationVariables = Types.Exact<{
  input: Types.UpdateEnrollmentProgressInput;
}>;


export type UpdateEnrollmentProgressMutation = { __typename?: 'Mutation', updateEnrollmentProgress: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export type SubmitContentReviewMutationVariables = Types.Exact<{
  input: Types.SubmitContentReviewInput;
}>;


export type SubmitContentReviewMutation = { __typename?: 'Mutation', submitContentReview: { __typename?: 'ContentReview', id: string, userId: string, rating: number, comment?: string | null, createdAt: string, updatedAt: string, contentId: string, contentType: Types.ContentType } };

export type DeleteContentReviewMutationVariables = Types.Exact<{
  input: Types.ContentActionInput;
}>;


export type DeleteContentReviewMutation = { __typename?: 'Mutation', deleteContentReview: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export type AddToCartMutationVariables = Types.Exact<{
  input: Types.ContentActionInput;
}>;


export type AddToCartMutation = { __typename?: 'Mutation', addToCart: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export type RemoveFromCartMutationVariables = Types.Exact<{
  input: Types.ContentActionInput;
}>;


export type RemoveFromCartMutation = { __typename?: 'Mutation', removeFromCart: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export type ClearCartMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type ClearCartMutation = { __typename?: 'Mutation', clearCart: { __typename?: 'ContentActionPayload', success: boolean, code: string, message: string, active?: boolean | null } };

export const ContentActionPayloadFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}
    `, {"fragmentName":"ContentActionPayloadFields"}) as unknown as TypedDocumentString<ContentActionPayloadFieldsFragment, unknown>;
export const WishlistContentFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment WishlistContentFields on WishlistContent {
  url
  slug
  title
  price
  isFree
  rating
  imageUrl
  category
  currency
  description
  providerName
}
    `, {"fragmentName":"WishlistContentFields"}) as unknown as TypedDocumentString<WishlistContentFieldsFragment, unknown>;
export const WishlistItemFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment WishlistItemFields on WishlistItem {
  id
  userId
  contentId
  createdAt
  contentType
  content {
    ...WishlistContentFields
  }
}
    fragment WishlistContentFields on WishlistContent {
  url
  slug
  title
  price
  isFree
  rating
  imageUrl
  category
  currency
  description
  providerName
}`, {"fragmentName":"WishlistItemFields"}) as unknown as TypedDocumentString<WishlistItemFieldsFragment, unknown>;
export const ContentEnrollmentFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ContentEnrollmentFields on ContentEnrollment {
  id
  userId
  status
  progress
  contentId
  createdAt
  startedAt
  updatedAt
  canceledAt
  contentType
  completedAt
}
    `, {"fragmentName":"ContentEnrollmentFields"}) as unknown as TypedDocumentString<ContentEnrollmentFieldsFragment, unknown>;
export const ContentReviewFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment ContentReviewFields on ContentReview {
  id
  userId
  rating
  comment
  createdAt
  updatedAt
  contentId
  contentType
}
    `, {"fragmentName":"ContentReviewFields"}) as unknown as TypedDocumentString<ContentReviewFieldsFragment, unknown>;
export const CartItemFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment CartItemFields on CartItem {
  id
  cartId
  status
  currency
  createdAt
  updatedAt
  contentId
  contentType
  titleSnapshot
  priceSnapshot
}
    `, {"fragmentName":"CartItemFields"}) as unknown as TypedDocumentString<CartItemFieldsFragment, unknown>;
export const CartFieldsFragmentDoc = /*#__PURE__*/ new TypedDocumentString(`
    fragment CartFields on Cart {
  id
  userId
  status
  items {
    ...CartItemFields
  }
  createdAt
  updatedAt
}
    fragment CartItemFields on CartItem {
  id
  cartId
  status
  currency
  createdAt
  updatedAt
  contentId
  contentType
  titleSnapshot
  priceSnapshot
}`, {"fragmentName":"CartFields"}) as unknown as TypedDocumentString<CartFieldsFragment, unknown>;
export const MyWishlistDocument = /*#__PURE__*/ new TypedDocumentString(`
    query MyWishlist($input: MyWishlistInput) {
  myWishlist(input: $input) {
    items {
      ...WishlistItemFields
    }
    page
    limit
    totalCount
    categories
    totalPages
    hasNextPage
    hasPreviousPage
  }
}
    fragment WishlistContentFields on WishlistContent {
  url
  slug
  title
  price
  isFree
  rating
  imageUrl
  category
  currency
  description
  providerName
}
fragment WishlistItemFields on WishlistItem {
  id
  userId
  contentId
  createdAt
  contentType
  content {
    ...WishlistContentFields
  }
}`) as unknown as TypedDocumentString<MyWishlistQuery, MyWishlistQueryVariables>;
export const ToggleWishlistDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ToggleWishlist($input: ContentActionInput!) {
  toggleWishlist(input: $input) {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<ToggleWishlistMutation, ToggleWishlistMutationVariables>;
export const MyEnrollmentsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query MyEnrollments {
  myEnrollments {
    ...ContentEnrollmentFields
  }
}
    fragment ContentEnrollmentFields on ContentEnrollment {
  id
  userId
  status
  progress
  contentId
  createdAt
  startedAt
  updatedAt
  canceledAt
  contentType
  completedAt
}`) as unknown as TypedDocumentString<MyEnrollmentsQuery, MyEnrollmentsQueryVariables>;
export const MyCartDocument = /*#__PURE__*/ new TypedDocumentString(`
    query MyCart {
  myCart {
    ...CartFields
  }
}
    fragment CartItemFields on CartItem {
  id
  cartId
  status
  currency
  createdAt
  updatedAt
  contentId
  contentType
  titleSnapshot
  priceSnapshot
}
fragment CartFields on Cart {
  id
  userId
  status
  items {
    ...CartItemFields
  }
  createdAt
  updatedAt
}`) as unknown as TypedDocumentString<MyCartQuery, MyCartQueryVariables>;
export const ContentReviewsDocument = /*#__PURE__*/ new TypedDocumentString(`
    query ContentReviews($contentType: ContentType!, $contentId: String!) {
  contentReviews(contentType: $contentType, contentId: $contentId) {
    ...ContentReviewFields
  }
}
    fragment ContentReviewFields on ContentReview {
  id
  userId
  rating
  comment
  createdAt
  updatedAt
  contentId
  contentType
}`) as unknown as TypedDocumentString<ContentReviewsQuery, ContentReviewsQueryVariables>;
export const MyReviewForContentDocument = /*#__PURE__*/ new TypedDocumentString(`
    query MyReviewForContent($contentType: ContentType!, $contentId: String!) {
  myReviewForContent(contentType: $contentType, contentId: $contentId) {
    ...ContentReviewFields
  }
}
    fragment ContentReviewFields on ContentReview {
  id
  userId
  rating
  comment
  createdAt
  updatedAt
  contentId
  contentType
}`) as unknown as TypedDocumentString<MyReviewForContentQuery, MyReviewForContentQueryVariables>;
export const EnrollContentDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation EnrollContent($input: ContentActionInput!) {
  enrollContent(input: $input) {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<EnrollContentMutation, EnrollContentMutationVariables>;
export const CancelContentEnrollmentDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CancelContentEnrollment($input: ContentActionInput!) {
  cancelContentEnrollment(input: $input) {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<CancelContentEnrollmentMutation, CancelContentEnrollmentMutationVariables>;
export const UpdateEnrollmentProgressDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation UpdateEnrollmentProgress($input: UpdateEnrollmentProgressInput!) {
  updateEnrollmentProgress(input: $input) {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<UpdateEnrollmentProgressMutation, UpdateEnrollmentProgressMutationVariables>;
export const SubmitContentReviewDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SubmitContentReview($input: SubmitContentReviewInput!) {
  submitContentReview(input: $input) {
    ...ContentReviewFields
  }
}
    fragment ContentReviewFields on ContentReview {
  id
  userId
  rating
  comment
  createdAt
  updatedAt
  contentId
  contentType
}`) as unknown as TypedDocumentString<SubmitContentReviewMutation, SubmitContentReviewMutationVariables>;
export const DeleteContentReviewDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation DeleteContentReview($input: ContentActionInput!) {
  deleteContentReview(input: $input) {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<DeleteContentReviewMutation, DeleteContentReviewMutationVariables>;
export const AddToCartDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation AddToCart($input: ContentActionInput!) {
  addToCart(input: $input) {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<AddToCartMutation, AddToCartMutationVariables>;
export const RemoveFromCartDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation RemoveFromCart($input: ContentActionInput!) {
  removeFromCart(input: $input) {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<RemoveFromCartMutation, RemoveFromCartMutationVariables>;
export const ClearCartDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation ClearCart {
  clearCart {
    ...ContentActionPayloadFields
  }
}
    fragment ContentActionPayloadFields on ContentActionPayload {
  success
  code
  message
  active
}`) as unknown as TypedDocumentString<ClearCartMutation, ClearCartMutationVariables>;