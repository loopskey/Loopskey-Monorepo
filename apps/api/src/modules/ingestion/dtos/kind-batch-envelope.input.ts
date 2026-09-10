import { Allow } from "class-validator";

/**
 * The batch envelope is intentionally unvalidated at the class-validator layer:
 * the batch runner parses and rejects it field by field so every failure
 * carries a stable ingestion message code rather than a generic 400. One
 * envelope shape serves every kind.
 */
export class KindBatchEnvelopeInput {
  @Allow() kind?: unknown;
  @Allow() mode?: unknown;
  @Allow() items?: unknown;
  @Allow() dryRun?: unknown;
  @Allow() contractVersion?: unknown;
}
