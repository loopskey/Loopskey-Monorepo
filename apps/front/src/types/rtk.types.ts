import { DocumentNode } from "graphql";

export type TGraphQLBaseQueryArgs<TVariables = Record<string, unknown>> = {
  variables?: TVariables;
  document: string | DocumentNode;
};

export type TGraphQLError = {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: Array<string | number>;
  extensions?: {
    code?: string;
    originalError?: {
      message?: string;
      statusCode?: number;
    };
    stacktrace?: string[];
    [key: string]: unknown;
  };
};

export type TGraphQLResponse<T> = {
  data?: T;
  errors?: TGraphQLError[];
};

export type TGraphQLBaseQueryError = {
  status: number;
  message: string;
  errors?: TGraphQLError[];
};
