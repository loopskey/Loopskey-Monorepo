import { CERTIFICATION_CATALOGUE_SOURCE_VERSION } from "./certification-catalogue.source";
export { CERTIFICATION_CATALOGUE_SOURCE_VERSION } from "./certification-catalogue.source";
export { CERTIFICATION_CATALOGUE_SOURCE } from "./certification-catalogue.source";
import { CERTIFICATION_CATALOGUE_SOURCE } from "./certification-catalogue.source";
import { importCertificationCatalogue } from "./certification-catalogue-import";
export { importCertificationCatalogue } from "./certification-catalogue-import";
export { validateCatalogueSource } from "./certification-catalogue-import";

import * as P from "@prisma/client";

export const seedCertificationCatalogue = async (prisma: P.PrismaClient) => {
  const result = await importCertificationCatalogue(
    prisma,
    CERTIFICATION_CATALOGUE_SOURCE,
    CERTIFICATION_CATALOGUE_SOURCE_VERSION,
  );

  if (result.rejected.length) {
    console.error(
      `Certification catalogue import rejected (version ${result.version}):`,
      result.rejected,
    );
    throw new Error("Certification catalogue import failed validation");
  }

  console.log(
    `Certification catalogue (${result.version}): ` +
      `${result.created.length} created, ${result.updated.length} updated, ` +
      `${result.unchanged.length} unchanged, ${result.retired.length} retired`,
  );
  return CERTIFICATION_CATALOGUE_SOURCE.length;
};
