import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ProfessionalGqlMutationNames } from "@professional/enums/gql-names.enum";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { ProfessionalSearchInput } from "@professional/dtos/professional-search.input";
import { CreatePduActivityInput } from "@professional/dtos/create-pdu-activity.input";
import { ProfessionalPduService } from "@professional/services/professional-pdu.service";
import { UpsertPduTargetInput } from "@professional/dtos/upsert-pdu-target.input";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";
import { Role } from "@prisma/client";

import * as EN from "@professional/entities/professinal-pdu-report.entity";

@Resolver()
@Roles(Role.PROFESSIONAL, Role.ADMIN)
export class ProfessionalPduResolver {
  constructor(
    private readonly professionalPduService: ProfessionalPduService,
  ) {}

  private getUser(user: TResolverUser) {
    return {
      id: user.id ?? user.sub!,
      role: user.role,
    };
  }

  @Query(() => EN.ProfessionalPduReportEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_PDU_REPORT,
  })
  professionalPduReport(
    @CurrentUser() user: TResolverUser,
    @Args("year", { type: () => Int, nullable: true }) year?: number,
  ) {
    return this.professionalPduService.pduReport(this.getUser(user), year);
  }

  @Query(() => EN.PaginatedProfessionalPduActivitiesEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_PDU_ACTIVITIES,
  })
  professionalPduActivities(
    @CurrentUser() user: TResolverUser,
    @Args("filter", { nullable: true }) filter?: ProfessionalSearchInput,
    @Args("pagination", { nullable: true })
    pagination?: ProfessionalPaginationInput,
  ) {
    return this.professionalPduService.pduActivities(
      this.getUser(user),
      filter,
      pagination,
    );
  }

  @Mutation(() => EN.ProfessionalPduActivityEntity, {
    name: ProfessionalGqlMutationNames.CREATE_PROFESSIONAL_PDU_ACTIVITY,
  })
  createProfessionalPduActivity(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: CreatePduActivityInput,
  ) {
    return this.professionalPduService.createPduActivity(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => EN.ProfessionalPduTargetEntity, {
    name: ProfessionalGqlMutationNames.UPSERT_PROFESSIONAL_PDU_TARGET,
  })
  upsertProfessionalPduTarget(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpsertPduTargetInput,
  ) {
    return this.professionalPduService.upsertPduTarget(
      this.getUser(user),
      input,
    );
  }
}
