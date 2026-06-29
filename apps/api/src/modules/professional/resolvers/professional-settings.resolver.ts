import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UpdateProfessionalSettingsInput } from "@professional/dtos/update-professional-settings.input";
import { ProfessionalGqlMutationNames } from "@professional/enums/gql-names.enum";
import { ProfessionalSettingsService } from "@professional/services/professional-settings.service";
import { ProfessionalSettingsEntity } from "@professional/entities/professional-settings.entity";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { ProfessionalSessionEntity } from "@professional/entities/professional-session.entity";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.PROFESSIONAL, Role.ADMIN)
export class ProfessionalSettingsResolver {
  constructor(
    private readonly professionalSettingsService: ProfessionalSettingsService,
  ) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => ProfessionalSettingsEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_SETTINGS,
  })
  professionalSettings(@CurrentUser() user: TResolverUser) {
    return this.professionalSettingsService.settings(this.getUser(user));
  }

  @Mutation(() => ProfessionalSettingsEntity, {
    name: ProfessionalGqlMutationNames.UPDATE_PROFESSIONAL_SETTINGS,
  })
  updateProfessionalSettings(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateProfessionalSettingsInput,
  ) {
    return this.professionalSettingsService.updateSettings(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => ProfessionalSettingsEntity, {
    name: ProfessionalGqlMutationNames.RESET_PROFESSIONAL_SETTINGS,
  })
  resetProfessionalSettings(@CurrentUser() user: TResolverUser) {
    return this.professionalSettingsService.resetSettings(this.getUser(user));
  }

  @Query(() => [ProfessionalSessionEntity], {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_ACTIVE_SESSIONS,
  })
  professionalActiveSessions(@CurrentUser() user: TResolverUser) {
    return this.professionalSettingsService.activeSessions(this.getUser(user));
  }
}
