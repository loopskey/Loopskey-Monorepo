import { SubmitAssociationAccessRequestInput } from "@association/dtos/submit-association-access-request.input";
import { AssociationActionResponseEntity } from "@association/entities/association-action-response.entity";
import { AssociationAccessRequestService } from "@association/services/association-access-request.service";
import { AssociationGqlMutationNames } from "@association/enums/association-gql-names.enum";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Public } from "@common/decorators/public.decorator";

@Resolver()
export class AssociationAccessRequestResolver {
  constructor(
    private readonly accessRequestService: AssociationAccessRequestService,
  ) {}

  @Public()
  @Mutation(() => AssociationActionResponseEntity, {
    name: AssociationGqlMutationNames.SUBMIT_ACCESS_REQUEST,
  })
  submitAssociationAccessRequest(
    @Args("input") input: SubmitAssociationAccessRequestInput,
  ) {
    return this.accessRequestService.submitRequest(input);
  }
}
