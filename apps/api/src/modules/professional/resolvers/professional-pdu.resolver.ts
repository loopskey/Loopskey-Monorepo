import { Args, ID, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ProfessionalPduActivityFilterInput } from "@professional/dtos/professional-pdu-activity-filter.input";
import { ProfessionalActionResponseEntity } from "@professional/entities/professional-calendar-event.entity";
import { ProfessionalGqlMutationNames } from "@professional/enums/gql-names.enum";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalGqlQueryNames } from "@professional/enums/gql-names.enum";
import { CreatePduActivityInput } from "@professional/dtos/create-pdu-activity.input";
import { UpdatePduActivityInput } from "@professional/dtos/update-pdu-activity.input";
import { ProfessionalPduService } from "@professional/services/professional-pdu.service";
import { UpsertPduTargetInput } from "@professional/dtos/upsert-pdu-target.input";
import { ContentType, Role } from "@prisma/client";
import { TResolverUser } from "@professional/types/professional-service.types";
import { CurrentUser } from "@auth/decorators/current-user.decorator";
import { Roles } from "@auth/decorators/roles.decorator";

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
    @Args("filter", { nullable: true })
    filter?: ProfessionalPduActivityFilterInput,
    @Args("pagination", { nullable: true })
    pagination?: ProfessionalPaginationInput,
  ) {
    return this.professionalPduService.pduActivities(
      this.getUser(user),
      filter,
      pagination,
    );
  }

  @Query(() => EN.ProfessionalPduActivitySummaryEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_PDU_ACTIVITY_SUMMARY,
  })
  professionalPduActivitySummary(@CurrentUser() user: TResolverUser) {
    return this.professionalPduService.pduActivitySummary(this.getUser(user));
  }

  @Query(() => EN.ProfessionalPduActivityEntity, {
    name: ProfessionalGqlQueryNames.PROFESSIONAL_PDU_ACTIVITY,
  })
  professionalPduActivity(
    @CurrentUser() user: TResolverUser,
    @Args("activityId", { type: () => ID }) activityId: string,
  ) {
    return this.professionalPduService.pduActivity(
      this.getUser(user),
      activityId,
    );
  }

  @Query(() => EN.ProfessionalPduActivityEntity, {
    nullable: true,
    name: ProfessionalGqlQueryNames.PROFESSIONAL_CONTENT_COMPLETION,
  })
  professionalContentCompletion(
    @CurrentUser() user: TResolverUser,
    @Args("contentType", { type: () => ContentType }) contentType: ContentType,
    @Args("contentId", { type: () => ID }) contentId: string,
  ) {
    return this.professionalPduService.contentCompletion(
      this.getUser(user),
      contentType,
      contentId,
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

  @Mutation(() => EN.ProfessionalPduActivityEntity, {
    name: ProfessionalGqlMutationNames.UPDATE_PROFESSIONAL_PDU_ACTIVITY,
  })
  updateProfessionalPduActivity(
    @CurrentUser() user: TResolverUser,
    @Args("input") input: UpdatePduActivityInput,
  ) {
    return this.professionalPduService.updatePduActivity(
      this.getUser(user),
      input,
    );
  }

  @Mutation(() => ProfessionalActionResponseEntity, {
    name: ProfessionalGqlMutationNames.DELETE_PROFESSIONAL_PDU_ACTIVITY,
  })
  deleteProfessionalPduActivity(
    @CurrentUser() user: TResolverUser,
    @Args("activityId", { type: () => ID }) activityId: string,
  ) {
    return this.professionalPduService.deletePduActivity(
      this.getUser(user),
      activityId,
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
