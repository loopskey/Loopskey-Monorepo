import { IngestionGqlObjectNames } from "@ingestion/enums/ingestion-gql-names.enum";
import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType(IngestionGqlObjectNames.INGESTION_API_KEY)
export class IngestionApiKeyEntity {
  @Field(() => ID) id: string;
  @Field() sourceId: string;
  @Field() name: string;
  @Field() prefix: string;
  @Field() createdAt: Date;
  @Field(() => Date, { nullable: true }) expiresAt?: Date | null;
  @Field(() => Date, { nullable: true }) revokedAt?: Date | null;
  @Field(() => Date, { nullable: true }) lastUsedAt?: Date | null;
}

@ObjectType(IngestionGqlObjectNames.ISSUED_INGESTION_API_KEY)
export class IssuedIngestionApiKeyEntity extends IngestionApiKeyEntity {
  @Field({
    description:
      "The plaintext credential. Shown exactly once, at issuance; it cannot be retrieved again.",
  })
  credential: string;
}
