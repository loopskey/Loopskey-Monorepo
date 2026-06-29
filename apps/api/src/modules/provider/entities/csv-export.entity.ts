import { ProviderGqlObjectNames } from "@provider/enums/gql-names.enum";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType(ProviderGqlObjectNames.CSV_EXPORT)
export class CsvExportEntity {
  @Field() content: string;
  @Field() filename: string;
  @Field() mimeType: string;
}
