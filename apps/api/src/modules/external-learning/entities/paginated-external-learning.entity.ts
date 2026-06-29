import { ExternalLearningGqlObjectNames } from "@ext/enums/gql-names.enum";
import { ExternalLearningActivityEntity } from "@ext/entities/external-learning-activity.entity";
import { OrganizationPageInfoEntity } from "@org/entities/page-info.entity";
import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType(ExternalLearningGqlObjectNames.PAGINATED_EXTERNAL_LEARNING)
export class PaginatedExternalLearningEntity {
  @Field(() => Int) totalCount: number;
  @Field(() => OrganizationPageInfoEntity) pageInfo: OrganizationPageInfoEntity;
  @Field(() => [ExternalLearningActivityEntity])
  items: ExternalLearningActivityEntity[];
}
