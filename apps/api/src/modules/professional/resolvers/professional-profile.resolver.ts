import { ProfessionalDashboardProfileEntity } from "@professional/entities/professional-profile.entity";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UpdateProfessionalProfileInput } from "@professional/dtos/update-professional-profile.input";
import { ProfessionalGqlMutationNames } from "@professional/enums/gql-names.enum";
import { ProfessionalProfileService } from "@professional/services/professional-profile.service";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.PROFESSIONAL, Role.ADMIN)
export class ProfessionalProfileResolver {
  constructor(
    private readonly professionalProfileService: ProfessionalProfileService,
  ) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => ProfessionalDashboardProfileEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_DASHBOARD_PROFILE,
  })
  professionalDashboardProfile(@CurrentUser() user: TResolverUser) {
    return this.professionalProfileService.profile(this.getUser(user));
  }

  @Mutation(() => ProfessionalDashboardProfileEntity, {
    name: ProfessionalGqlMutationNames.UPDATE_PROFESSIONAL_DASHBOARD_PROFILE,
  })
  updateProfessionalDashboardProfile(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateProfessionalProfileInput,
  ) {
    return this.professionalProfileService.updateProfile(
      this.getUser(user),
      input,
    );
  }
}
