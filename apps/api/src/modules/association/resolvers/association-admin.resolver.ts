import { ResendAssociationActivationInput } from "@association/dtos/resend-association-activation.input";
import { AssociationActionResponseEntity } from "@association/entities/association-action-response.entity";
import { CreateAssociationAccountInput } from "@association/dtos/create-association-account.input";
import { AssociationGqlMutationNames } from "@association/enums/association-gql-names.enum";
import { AssociationAccountService } from "@association/services/association-account.service";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.ADMIN)
export class AssociationAdminResolver {
  constructor(private readonly accounts: AssociationAccountService) {}

  private actorId(user: TResolverUser) {
    return user.id ?? user.sub!;
  }

  @Mutation(() => AssociationActionResponseEntity, {
    name: AssociationGqlMutationNames.CREATE_ACCOUNT,
  })
  createAssociationAccount(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: CreateAssociationAccountInput,
  ) {
    return this.accounts.createAccount(this.actorId(user), input);
  }

  @Mutation(() => AssociationActionResponseEntity, {
    name: AssociationGqlMutationNames.RESEND_ACTIVATION,
  })
  resendAssociationActivation(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: ResendAssociationActivationInput,
  ) {
    return this.accounts.resendActivation(
      this.actorId(user),
      input.associationId,
    );
  }
}
