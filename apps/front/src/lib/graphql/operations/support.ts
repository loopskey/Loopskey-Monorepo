import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type SubmitContactInquiryMutationVariables = Types.Exact<{
  input: Types.SubmitContactInquiryInput;
}>;


export type SubmitContactInquiryMutation = { __typename?: 'Mutation', submitContactInquiry: { __typename?: 'SubmitContactInquiryPayload', success: boolean, code: string, referenceId?: string | null } };


export const SubmitContactInquiryDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation SubmitContactInquiry($input: SubmitContactInquiryInput!) {
  submitContactInquiry(input: $input) {
    success
    code
    referenceId
  }
}
    `) as unknown as TypedDocumentString<SubmitContactInquiryMutation, SubmitContactInquiryMutationVariables>;