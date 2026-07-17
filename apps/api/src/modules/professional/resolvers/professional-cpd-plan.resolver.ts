import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateCpdPlanFromSuggestionInput } from "@professional/dtos/create-cpd-plan-from-suggestion.input";
import { ProfessionalActionResponseEntity } from "@professional/entities/professional-calendar-event.entity";
import { CpdReportRecipientOptionEntity } from "@professional/entities/cpd-plan.entity";
import { ProfessionalGqlMutationNames } from "@professional/enums/gql-names.enum";
import { CertificationSearchService } from "@professional/services/certification-search.service";
import { ProfessionalCpdPlanService } from "@professional/services/professional-cpd-plan.service";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { CertificationSearchInput } from "@professional/dtos/certification-search.input";
import { CpdPlanProgressEntity } from "@professional/entities/cpd-plan.entity";
import { CertificationEntity } from "@professional/entities/certification.entity";
import { CreateCpdPlanInput } from "@professional/dtos/create-cpd-plan.input";
import { UpdateCpdPlanInput } from "@professional/dtos/update-cpd-plan.input";
import { CpdPlanEntity } from "@professional/entities/cpd-plan.entity";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Resolver()
@Roles(Role.PROFESSIONAL, Role.ADMIN)
export class ProfessionalCpdPlanResolver {
  constructor(
    private readonly cpdPlanService: ProfessionalCpdPlanService,
    private readonly certificationSearchService: CertificationSearchService,
  ) {}

  private getUser(user: TResolverUser) {
    return { id: user.id ?? user.sub!, role: user.role };
  }

  @Query(() => [CertificationEntity], {
    name: ProfessionalGqlQueryNames.CERTIFICATION_SEARCH,
  })
  certificationSearch(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: CertificationSearchInput,
  ) {
    return this.certificationSearchService.search(this.getUser(user), input);
  }

  @Query(() => [CpdPlanEntity], {
    name: ProfessionalGqlQueryNames.MY_CPD_PLANS,
  })
  myCpdPlans(@CurrentUser() user: TResolverUser) {
    return this.cpdPlanService.myPlans(this.getUser(user));
  }

  @Query(() => CpdPlanEntity, { name: ProfessionalGqlQueryNames.CPD_PLAN })
  cpdPlan(
    @CurrentUser() user: TResolverUser,
    @Args("planId", { type: () => ID }) planId: string,
  ) {
    return this.cpdPlanService.plan(this.getUser(user), planId);
  }

  @Query(() => CpdPlanProgressEntity, {
    name: ProfessionalGqlQueryNames.CPD_PLAN_PROGRESS,
  })
  cpdPlanProgress(
    @CurrentUser() user: TResolverUser,
    @Args("planId", { type: () => ID }) planId: string,
  ) {
    return this.cpdPlanService.progress(this.getUser(user), planId);
  }

  @Query(() => [CpdReportRecipientOptionEntity], {
    name: ProfessionalGqlQueryNames.CPD_REPORT_RECIPIENTS,
  })
  cpdReportRecipients(@CurrentUser() user: TResolverUser) {
    return this.cpdPlanService.reportRecipients(this.getUser(user));
  }

  @Mutation(() => CpdPlanEntity, {
    name: ProfessionalGqlMutationNames.CREATE_CPD_PLAN,
  })
  createCpdPlan(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: CreateCpdPlanInput,
  ) {
    return this.cpdPlanService.createPlan(this.getUser(user), input);
  }

  @Mutation(() => CpdPlanEntity, {
    name: ProfessionalGqlMutationNames.CREATE_CPD_PLAN_FROM_SUGGESTION,
  })
  createCpdPlanFromSuggestion(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: CreateCpdPlanFromSuggestionInput,
  ) {
    return this.cpdPlanService.createPlanFromSuggestion(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => CpdPlanEntity, {
    name: ProfessionalGqlMutationNames.UPDATE_CPD_PLAN,
  })
  updateCpdPlan(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateCpdPlanInput,
  ) {
    return this.cpdPlanService.updatePlan(this.getUser(user), input);
  }

  @Mutation(() => ProfessionalActionResponseEntity, {
    name: ProfessionalGqlMutationNames.DELETE_CPD_PLAN,
  })
  deleteCpdPlan(
    @CurrentUser() user: TResolverUser,
    @Args("planId", { type: () => ID }) planId: string,
  ) {
    return this.cpdPlanService.deletePlan(this.getUser(user), planId);
  }
}
