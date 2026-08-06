import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";
import { SubmitContactInquiryPayload } from "@support/entities/contact-inquiry.entity";
import { SubmitContactInquiryInput } from "@support/dtos/submit-contact-inquiry.input";
import { ContactInquiryService } from "@support/services/contact-inquiry.service";
import { ContactGqlNames } from "@support/enums/contact-inquiry.enum";
import { Public } from "@common/decorators/public.decorator";

type GqlContext = { req?: { ip?: string; ips?: string[] } };

@Resolver(() => SubmitContactInquiryPayload)
export class ContactResolver {
  constructor(private readonly contactInquiryService: ContactInquiryService) {}

  @Public()
  @Mutation(() => SubmitContactInquiryPayload, {
    name: ContactGqlNames.SUBMIT_CONTACT_INQUIRY,
  })
  submitContactInquiry(
    @Args("input") input: SubmitContactInquiryInput,
    @Context() context: GqlContext,
  ) {
    const clientIp = context.req?.ips?.[0] ?? context.req?.ip;
    return this.contactInquiryService.submitInquiry(input, clientIp);
  }
}
