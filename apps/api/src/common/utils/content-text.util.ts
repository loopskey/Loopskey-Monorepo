const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
};

const ENTITY_PATTERN =
  /&(amp|lt|gt|quot|apos|nbsp|#[0-9]{1,7}|#x[0-9a-f]{1,6});/gi;

export const decodeContentText = (value: string): string =>
  value.replace(ENTITY_PATTERN, (entity: string, key: string) => {
    const named = ENTITIES[key.toLowerCase()];
    if (named) return named;
    const hex = key[1].toLowerCase() === "x";
    const point = Number.parseInt(key.slice(hex ? 2 : 1), hex ? 16 : 10);
    return point >= 32 &&
      point <= 0x10ffff &&
      !(point >= 0x7f && point <= 0x9f) &&
      !(point >= 0xd800 && point <= 0xdfff)
      ? String.fromCodePoint(point)
      : entity;
  });

export const presentContentText = <TRecord extends { title: string }>(
  record: TRecord,
): TRecord => {
  const result: Record<string, unknown> = { ...record };
  let changed = false;
  for (const field of [
    "title",
    "description",
    "instructor",
    "organizer",
    "host",
  ])
    if (typeof result[field] === "string") {
      const text = decodeContentText(result[field]);
      changed ||= text !== result[field];
      result[field] = text;
    }
  for (const field of ["learnings", "requirements"])
    if (Array.isArray(result[field])) {
      const previous = result[field];
      const values = previous.map((value: unknown) =>
        typeof value === "string" ? decodeContentText(value) : value,
      );
      if (values.some((value, index) => value !== previous[index])) {
        result[field] = values;
        changed = true;
      }
    }
  return changed ? (result as TRecord) : record;
};
