"use client";

import { TDetailSidebarProps } from "@/types/content-module.types";
import { ContentThumbnail } from "@elements/content-thumbnail";
import { GlassCard } from "@elements/glass-card";

import DetailMetaPill from "@modules/ContentDetail/parts/DetailMetaPill";

const DetailSidebar = ({
  id,
  kind,
  title,
  facts,
  summary,
  actions,
  imageUrl,
  category,
}: TDetailSidebarProps) => {
  const visibleFacts = facts.filter(
    (fact) => fact.value !== undefined && fact.value !== null && fact.value !== "",
  );

  return (
    <GlassCard className="overflow-hidden p-0 md:p-0">
      <div className="relative aspect-video bg-muted">
        <ContentThumbnail
          priority
          id={id}
          kind={kind}
          title={title}
          imageUrl={imageUrl}
          category={category}
          sizes="(max-width: 1024px) 100vw, 360px"
        />
      </div>

      <div className="space-y-5 p-5">
        {summary}

        <div className="space-y-3">{actions}</div>

        {visibleFacts.length > 0 && (
          <div className="space-y-4 border-t pt-5">
            {visibleFacts.map((fact) => (
              <DetailMetaPill
                multiline
                key={fact.key}
                icon={fact.icon}
                label={fact.label}
                value={fact.value}
              />
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default DetailSidebar;
