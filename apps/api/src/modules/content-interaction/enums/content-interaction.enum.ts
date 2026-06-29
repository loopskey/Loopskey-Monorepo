import { CartItemStatus, CartStatus, ContentType } from "@prisma/client";
import { ContentEnrollmentStatus } from "@prisma/client";
import { registerEnumType } from "@nestjs/graphql";

registerEnumType(ContentType, {
  name: "ContentType",
});

registerEnumType(ContentEnrollmentStatus, {
  name: "ContentEnrollmentStatus",
});

registerEnumType(CartStatus, {
  name: "CartStatus",
});

registerEnumType(CartItemStatus, {
  name: "CartItemStatus",
});
