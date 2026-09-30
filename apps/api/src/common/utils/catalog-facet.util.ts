import { Logger } from "@nestjs/common";

import { requestContext } from "@infrastructure/observability/request-context";

export type CatalogFacetKind = "course" | "event" | "podcast" | "youtube";

export type EnumFacet<TValue extends string> = {
  value: TValue;
  count: number;
};

const FACET_SLOW_QUERY_THRESHOLD_MS = Number(
  process.env.CONTENT_FACET_SLOW_QUERY_MS ?? 500,
);

export const toEnumFacets = <TValue extends string>(
  rows: readonly { value: TValue; count: number }[],
): EnumFacet<TValue>[] =>
  rows
    .filter((row) => row.count > 0)
    .map((row) => ({ value: row.value, count: row.count }))
    .sort((left, right) => (left.value < right.value ? -1 : 1));

export const measureCatalogFacets = async <TFacets>(
  logger: Logger,
  kind: CatalogFacetKind,
  work: () => Promise<TFacets>,
  optionCount: (facets: TFacets) => number,
) => {
  const startedAt = Date.now();
  const facets = await work();
  const durationMs = Date.now() - startedAt;
  const context = {
    kind,
    durationMs,
    options: optionCount(facets),
    correlationId: requestContext.correlationId(),
  };
  if (durationMs > FACET_SLOW_QUERY_THRESHOLD_MS)
    logger.warn("Catalogue facet query exceeded slow-query threshold", context);
  else logger.log("Catalogue facets computed", context);
  return facets;
};
