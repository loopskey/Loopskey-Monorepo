import { UpdateProfessionalBasicProfileInput } from "@professional/dtos/update-professional-basic-profile.input";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ProfessionalDashboardProfileEntity } from "@professional/entities/professional-profile.entity";
import { UpdateProfessionalPreferencesInput } from "@professional/dtos/update-professional-preferences.input";
import { CreateProfessionalCredentialInput } from "@professional/dtos/create-professional-credential.input";
import { UpdateProfessionalCredentialInput } from "@professional/dtos/update-professional-credential.input";
import { ProfessionalActionResponseEntity } from "@professional/entities/professional-calendar-event.entity";
import { ProfessionalTaxonomyGroupEntity } from "@professional/entities/professional-profile-taxonomy.entity";
import { PaginatedProfessionalTaxonomyTermsEntity } from "@professional/entities/professional-profile-taxonomy.entity";
import { ProfessionalTaxonomyCategoryEntity } from "@professional/entities/professional-profile-taxonomy.entity";
import { ProfessionalSkillSuggestionsEntity } from "@professional/entities/professional-profile-taxonomy.entity";
import { ProfessionalTaxonomyTermEntity } from "@professional/entities/professional-profile-taxonomy.entity";
import { ProfessionalTaxonomyTermsInput } from "@professional/dtos/professional-taxonomy-terms.input";
import { ProfessionalTaxonomyService } from "@professional/services/professional-taxonomy.service";
import { UpdateProfessionalDetailsInput } from "@professional/dtos/update-professional-details.input";
import { ProfessionalCredentialService } from "@professional/services/professional-credential.service";
import { UpdateProfessionalSkillsInput } from "@professional/dtos/update-professional-skills.input";
import { ProfessionalGqlMutationNames } from "@professional/enums/gql-names.enum";
import { ProfessionalProfileService } from "@professional/services/professional-profile.service";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { ProfileTaxonomyKind, Role } from "@prisma/client";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";

import * as E from "@professional/entities/professional-credential.entity";

@Resolver()
@Roles(Role.PROFESSIONAL, Role.ADMIN)
export class ProfessionalProfileResolver {
  constructor(
    private readonly professionalProfileService: ProfessionalProfileService,
    private readonly professionalCredentialService: ProfessionalCredentialService,
    private readonly taxonomyService: ProfessionalTaxonomyService,
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

  @Query(() => [ProfessionalTaxonomyGroupEntity], {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_PROFILE_TAXONOMY,
  })
  professionalProfileTaxonomy(
    @CurrentUser() user: TResolverUser,
    @Args("kind", { type: () => ProfileTaxonomyKind })
    kind: ProfileTaxonomyKind,
  ) {
    return this.professionalProfileService.taxonomy(this.getUser(user), kind);
  }

  @Query(() => [ProfessionalTaxonomyCategoryEntity], {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_TAXONOMY_CATEGORIES,
  })
  professionalTaxonomyCategories(
    @CurrentUser() user: TResolverUser,
    @Args("kind", { type: () => ProfileTaxonomyKind })
    kind: ProfileTaxonomyKind,
  ) {
    return this.taxonomyService.groups(this.getUser(user), kind);
  }

  @Query(() => PaginatedProfessionalTaxonomyTermsEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_TAXONOMY_TERMS,
  })
  professionalTaxonomyTerms(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: ProfessionalTaxonomyTermsInput,
  ) {
    return this.taxonomyService.terms(this.getUser(user), input);
  }

  @Query(() => [ProfessionalTaxonomyTermEntity], {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_TAXONOMY_TERMS_BY_IDS,
  })
  professionalTaxonomyTermsByIds(
    @CurrentUser() user: TResolverUser,
    @Args("ids", { type: () => [ID] }) ids: string[],
  ) {
    return this.taxonomyService.termsByIds(this.getUser(user), ids);
  }

  @Query(() => ProfessionalSkillSuggestionsEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_SKILL_SUGGESTIONS,
  })
  professionalSkillSuggestions(
    @CurrentUser() user: TResolverUser,
    @Args("roleTermId", { type: () => ID, nullable: true })
    roleTermId?: string | null,
  ) {
    return this.taxonomyService.skillSuggestions(
      this.getUser(user),
      roleTermId,
    );
  }

  @Query(() => [E.ProfessionalCpdPlanEntity], {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_CPD_PLANS,
  })
  professionalCpdPlans(@CurrentUser() user: TResolverUser) {
    return this.professionalProfileService.cpdPlans(this.getUser(user));
  }

  @Mutation(() => ProfessionalDashboardProfileEntity, {
    name: ProfessionalGqlMutationNames.UPDATE_PROFESSIONAL_BASIC_PROFILE,
  })
  updateProfessionalBasicProfile(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateProfessionalBasicProfileInput,
  ) {
    return this.professionalProfileService.updateBasicProfile(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => ProfessionalDashboardProfileEntity, {
    name: ProfessionalGqlMutationNames.UPDATE_PROFESSIONAL_DETAILS,
  })
  updateProfessionalDetails(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateProfessionalDetailsInput,
  ) {
    return this.professionalProfileService.updateDetails(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => ProfessionalDashboardProfileEntity, {
    name: ProfessionalGqlMutationNames.UPDATE_PROFESSIONAL_SKILLS,
  })
  updateProfessionalSkills(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateProfessionalSkillsInput,
  ) {
    return this.professionalProfileService.updateSkills(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => ProfessionalDashboardProfileEntity, {
    name: ProfessionalGqlMutationNames.UPDATE_PROFESSIONAL_PREFERENCES,
  })
  updateProfessionalPreferences(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateProfessionalPreferencesInput,
  ) {
    return this.professionalProfileService.updatePreferences(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => E.ProfessionalCredentialEntity, {
    name: ProfessionalGqlMutationNames.CREATE_PROFESSIONAL_CREDENTIAL,
  })
  createProfessionalCredential(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: CreateProfessionalCredentialInput,
  ) {
    return this.professionalCredentialService.create(this.getUser(user), input);
  }

  @Mutation(() => E.ProfessionalCredentialEntity, {
    name: ProfessionalGqlMutationNames.UPDATE_PROFESSIONAL_CREDENTIAL,
  })
  updateProfessionalCredential(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdateProfessionalCredentialInput,
  ) {
    return this.professionalCredentialService.update(this.getUser(user), input);
  }

  @Mutation(() => ProfessionalActionResponseEntity, {
    name: ProfessionalGqlMutationNames.DELETE_PROFESSIONAL_CREDENTIAL,
  })
  deleteProfessionalCredential(
    @CurrentUser() user: TResolverUser,
    @Args("credentialId", { type: () => ID }) credentialId: string,
  ) {
    return this.professionalCredentialService.delete(
      this.getUser(user),
      credentialId,
    );
  }
}
