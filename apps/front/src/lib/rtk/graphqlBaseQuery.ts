import { executeWithRefresh } from "@/lib/graphql/request";
import { BaseQueryFn } from "@reduxjs/toolkit/query";

import * as T from "@/types/rtk.types";

export const graphqlBaseQuery =
  (): BaseQueryFn<T.TGraphQLBaseQueryArgs, unknown, T.TGraphQLBaseQueryError> =>
  (args, api) =>
    executeWithRefresh(args, api.signal);
