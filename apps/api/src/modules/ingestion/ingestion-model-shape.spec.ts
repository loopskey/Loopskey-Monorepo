import { Prisma } from "@prisma/client";

const fieldsOf = (model: string) => {
  const found = Prisma.dmmf.datamodel.models.find(
    (candidate) => candidate.name === model,
  );
  if (!found) throw new Error(`${model} is not in the Prisma datamodel.`);
  return found;
};

const RAW_PAYLOAD_NAMES =
  /^(raw|rawData|rawPayload|payload|body|document|snapshot|content|sourceJson)$/i;

describe("ingestion model shape", () => {
  it("keeps no raw payload on IngestionItem", () => {
    const suspicious = fieldsOf("IngestionItem")
      .fields.filter((field) => RAW_PAYLOAD_NAMES.test(field.name))
      .map((field) => field.name);

    expect(suspicious).toEqual([]);
  });

  it("stores no Json blob on IngestionItem, under any name", () => {
    const jsonFields = fieldsOf("IngestionItem")
      .fields.filter((field) => field.type === "Json")
      .map((field) => field.name);

    expect(jsonFields).toEqual([]);
  });

  it("identifies an item by its source and external id", () => {
    expect(fieldsOf("IngestionItem").uniqueFields).toContainEqual([
      "sourceId",
      "externalId",
    ]);
  });

  it("identifies a batch by its source and idempotency key", () => {
    expect(fieldsOf("IngestionBatch").uniqueFields).toContainEqual([
      "sourceId",
      "idempotencyKey",
    ]);
  });

  it("stores a key by unique prefix and a hash, never a secret", () => {
    const key = fieldsOf("IngestionApiKey");
    const prefix = key.fields.find((field) => field.name === "prefix");

    expect(prefix?.isUnique).toBe(true);
    expect(key.fields.map((field) => field.name)).toContain("secretHash");
    expect(key.fields.map((field) => field.name)).not.toContain("secret");
  });
});
