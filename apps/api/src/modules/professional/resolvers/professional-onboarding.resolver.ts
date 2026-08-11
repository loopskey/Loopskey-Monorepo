import { CompleteProfessionalOnboardingInput } from "@professional/dtos/complete-professional-onboarding.input";
import { ProfessionalDashboardProfileEntity } from "@professional/entities/professional-profile.entity";
import { ProfessionalOnboardingService } from "@professional/services/professional-onboarding.service";
import { ProfessionalGqlMutationNames } from "@professional/enums/gql-names.enum";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.PROFESSIONAL, Role.ADMIN)
export class ProfessionalOnboardingResolver {
  constructor(
    private readonly onboardingService: ProfessionalOnboardingService,
  ) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Mutation(() => ProfessionalDashboardProfileEntity, {
    name: ProfessionalGqlMutationNames.START_PROFESSIONAL_ONBOARDING,
  })
  startProfessionalOnboarding(@CurrentUser() user: TResolverUser) {
    return this.onboardingService.start(this.getUser(user));
  }

  @Mutation(() => ProfessionalDashboardProfileEntity, {
    name: ProfessionalGqlMutationNames.COMPLETE_PROFESSIONAL_ONBOARDING,
  })
  completeProfessionalOnboarding(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: CompleteProfessionalOnboardingInput,
  ) {
    return this.onboardingService.complete(this.getUser(user), input);
  }
}
