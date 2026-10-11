import { CONTENT_URL_KIND_GQL_NAME } from "@contentUrl/enums/gql-names.enum";
import { ContentUrlNamespace } from "@prisma/client";
import { registerEnumType } from "@nestjs/graphql";

registerEnumType(ContentUrlNamespace, { name: CONTENT_URL_KIND_GQL_NAME });
