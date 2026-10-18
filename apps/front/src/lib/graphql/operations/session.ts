import * as Types from "@/lib/graphql/base";
import { TypedDocumentString } from "@/lib/graphql/document";
export type CurrentUserQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: 'Query', currentUser: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, bio?: string | null, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type RefreshTokenMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type RefreshTokenMutation = { __typename?: 'Mutation', refreshToken: { __typename?: 'AuthPayload', code: string, success: boolean, message: string, user?: { __typename?: 'AuthUser', id: string, role: Types.Role, email?: string | null, status: Types.UserStatus, fullName?: string | null, avatarUrl?: string | null, emailVerifiedAt?: string | null, forcePasswordChange: boolean } | null } };

export type LogoutMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: { __typename?: 'AuthPayload', code: string, success: boolean, message: string } };


export const CurrentUserDocument = /*#__PURE__*/ new TypedDocumentString(`
    query CurrentUser {
  currentUser {
    code
    success
    message
    user {
      id
      bio
      role
      email
      status
      fullName
      avatarUrl
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<CurrentUserQuery, CurrentUserQueryVariables>;
export const RefreshTokenDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation RefreshToken {
  refreshToken {
    code
    success
    message
    user {
      id
      role
      email
      status
      fullName
      avatarUrl
      emailVerifiedAt
      forcePasswordChange
    }
  }
}
    `) as unknown as TypedDocumentString<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const LogoutDocument = /*#__PURE__*/ new TypedDocumentString(`
    mutation Logout {
  logout {
    code
    success
    message
  }
}
    `) as unknown as TypedDocumentString<LogoutMutation, LogoutMutationVariables>;