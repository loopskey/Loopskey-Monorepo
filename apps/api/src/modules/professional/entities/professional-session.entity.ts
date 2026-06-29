import { ProfessionalGqlObjectNames } from "@professional/enums/gql-names.enum";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { SessionStatus } from "@prisma/client";

@ObjectType(ProfessionalGqlObjectNames.PROFESSIONAL_SESSION)
export class ProfessionalSessionEntity {
  @Field() expiresAt: Date;
  @Field() updatedAt: Date;
  @Field() createdAt: Date;
  @Field(() => ID) id: string;
  @Field(() => ID) userId: string;
  @Field(() => SessionStatus) status: SessionStatus;
  @Field(() => Date, { nullable: true }) revokedAt?: Date | null;
  @Field(() => String, { nullable: true }) ipAddress?: string | null;
  @Field(() => String, { nullable: true }) userAgent?: string | null;
}
