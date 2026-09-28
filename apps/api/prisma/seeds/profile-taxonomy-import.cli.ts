import { buildTaxonomyCatalog } from "./profile-taxonomy-import";
import { TAXONOMY_WORKBOOK_FILE } from "./profile-taxonomy-import";
import { writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(__dirname, "data");

export const TAXONOMY_CATALOG_FILE = "profile-taxonomy.catalog.json";

const main = async () => {
  const catalog = await buildTaxonomyCatalog(
    join(DATA_DIR, TAXONOMY_WORKBOOK_FILE),
  );
  writeFileSync(
    join(DATA_DIR, TAXONOMY_CATALOG_FILE),
    `${JSON.stringify(catalog, null, 2)}\n`,
  );
  const count = (groups: { terms: unknown[] }[]) =>
    groups.reduce((total, group) => total + group.terms.length, 0);
  console.log(
    `Profile taxonomy catalogue written: ${catalog.roles.length} role categories, ${count(catalog.roles)} roles, ${catalog.skills.length} skill categories, ${count(catalog.skills)} skills.`,
  );
};

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
