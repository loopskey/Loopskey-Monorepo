import { Allow } from "class-validator";

export class CourseBatchEnvelopeInput {
  @Allow() kind?: unknown;
  @Allow() mode?: unknown;
  @Allow() items?: unknown;
  @Allow() dryRun?: unknown;
  @Allow() contractVersion?: unknown;
}
