import { AssociationComplianceSettingsPayloadEntity } from "@association/entities/association-settings.entity";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AssociationGqlMutationNames } from "@association/enums/association-gql-names.enum";
import { AssociationSettingsService } from "@association/services/association-settings.service";
import { AssociationSettingsEntity } from "@association/entities/association-settings.entity";
import { AssociationGqlQueryNames } from "@association/enums/association-gql-names.enum";
import { TResolverUser } from "@association/types/association-service.types";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";
import { Role } from "@prisma/client";

import * as DTO from "@association/dtos/association-settings.input";

@Resolver()
@Roles(Role.ASSOCIATION, Role.ADMIN)
export class AssociationSettingsResolver {
  constructor(private readonly settings: AssociationSettingsService) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Query(() => AssociationSettingsEntity, {
    name: AssociationGqlQueryNames.SETTINGS,
  })
  associationSettings(
    @CurrentUser() user: TResolverUser,
    @Args("associationId", { type: () => ID, nullable: true })
    associationId?: string,
  ) {
    return this.settings.settings(this.getUser(user), associationId);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationComplianceSettingsPayloadEntity, {
    name: AssociationGqlMutationNames.UPDATE_COMPLIANCE_SETTINGS,
  })
  updateAssociationComplianceSettings(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.UpdateAssociationComplianceSettingsInput,
  ) {
    return this.settings.updateCompliance(this.getUser(user), input);
  }

  @Roles(Role.ASSOCIATION)
  @Mutation(() => AssociationSettingsEntity, {
    name: AssociationGqlMutationNames.UPDATE_NOTIFICATION_SETTINGS,
  })
  updateAssociationNotificationSettings(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: DTO.UpdateAssociationNotificationSettingsInput,
  ) {
    return this.settings.updateNotifications(this.getUser(user), input);
  }
}
