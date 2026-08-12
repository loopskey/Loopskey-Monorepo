import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/base";
export type MeQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, bio?: string | null, role: Types.Role, email?: string | null, phone?: string | null, status: Types.UserStatus, lastName?: string | null, fullName?: string | null, firstName?: string | null, avatarUrl?: string | null, updatedAt: string, createdAt: string, deletedAt?: string | null, lastLoginAt?: string | null, emailVerifiedAt?: string | null, phoneVerifiedAt?: string | null, professionalProfile?: { __typename?: 'ProfessionalProfile', id: string, userId: string, skills: Array<string>, industry?: Types.ProfessionalIndustry | null, interests: Array<string>, createdAt: string, updatedAt: string, profession?: string | null, currentRole?: string | null, workLocation?: string | null, experienceRange?: Types.ExperienceRange | null } | null, providerProfile?: { __typename?: 'ProviderProfile', id: string, userId: string, website?: string | null, logoUrl?: string | null, isPremium: boolean, createdAt: string, updatedAt: string, contactEmail?: string | null, contactPhone?: string | null, organizationName?: string | null } | null, organizationProfile?: { __typename?: 'OrganizationProfile', id: string, userId: string, website?: string | null, logoUrl?: string | null, country?: string | null, industry?: string | null, timezone?: string | null, createdAt: string, updatedAt: string, memberLimit?: number | null, contactEmail?: string | null, contactPhone?: string | null, organizationName: string } | null } };

export type UpdateMeMutationVariables = Types.Exact<{
  input: Types.UpdateMeInput;
}>;


export type UpdateMeMutation = { __typename?: 'Mutation', updateMe: { __typename?: 'User', id: string, bio?: string | null, role: Types.Role, email?: string | null, phone?: string | null, status: Types.UserStatus, lastName?: string | null, fullName?: string | null, avatarUrl?: string | null, firstName?: string | null, updatedAt: string } };

export type CreateUserMutationVariables = Types.Exact<{
  input: Types.CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser: { __typename?: 'User', id: string, role: Types.Role, email?: string | null, phone?: string | null, status: Types.UserStatus, fullName?: string | null, createdAt: string } };


export const MeDocument = /*#__PURE__*/ new TypedDocumentString(`
    query Me {
  me {
    id
    bio
    role
    email
    phone
    status
    lastName
    fullName
    firstName
    avatarUrl
    updatedAt
    createdAt
    deletedAt
    lastLoginAt
    emailVerifiedAt
    phoneVerifiedAt
    professionalProfile {
      id
      userId
      skills
      industry
      interests
      createdAt
      updatedAt
      profession
      currentRole
      workLocation
      experienceRange
    }
    providerProfile {
      id
      userId
      website
      logoUrl
      isPremium
      createdAt
      updatedAt
      contactEmail
      contactPhone
      organizationName
    }
    organizationProfile {
      id
      userId
      website
      logoUrl
      country
      industry
      timezone
      createdAt
      updatedAt
      memberLimit
      contactEmail
      contactPhone
      organizationName
    }
  }
}
    `) as unknown as TypedDocumentString<MeQuery, MeQueryVariables>;
export const UpdateMeDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation UpdateMe($input: UpdateMeInput!) {
  updateMe(input: $input) {
    id
    bio
    role
    email
    phone
    status
    lastName
    fullName
    avatarUrl
    firstName
    updatedAt
  }
}
    `) as unknown as TypedDocumentString<UpdateMeMutation, UpdateMeMutationVariables>;
export const CreateUserDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    role
    email
    phone
    status
    fullName
    createdAt
  }
}
    `) as unknown as TypedDocumentString<CreateUserMutation, CreateUserMutationVariables>;