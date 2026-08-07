import { Field, ObjectType } from "@nestjs/graphql";
import { ContactGqlNames } from "@support/enums/contact-inquiry.enum";

@ObjectType(ContactGqlNames.SUBMIT_CONTACT_INQUIRY_PAYLOAD)
export class SubmitContactInquiryPayload {
  @Field(() => String) code!: string;
  @Field(() => Boolean) success!: boolean;
  @Field(() => String, { nullable: true }) referenceId?: string;
}
