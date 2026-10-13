import { serializeJsonLd } from "@/lib/structured-data/json-ld";

import type { JsonLdNode } from "@/lib/structured-data/json-ld";

type TJsonLdProps = {
  nodes: readonly JsonLdNode[];
};

const JsonLd = ({ nodes }: TJsonLdProps) => {
  if (nodes.length === 0) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(nodes) }}
    />
  );
};

export default JsonLd;
