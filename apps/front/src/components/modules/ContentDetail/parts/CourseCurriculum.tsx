"use client";

import { BookOpen, CheckCircle2, Clock3, Lock, PlayCircle } from "lucide-react";
import { TCourseCurriculumProps } from "@/types/content-module.types";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";

const CourseCurriculum = ({ sections }: TCourseCurriculumProps) => {
  const { t } = useI18n();

  if (!sections?.length) {
    return (
      <GlassCard className="p-8 text-center" glow={false}>
        <div className="relative z-10">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h3 className="font-medium">
            {t("contentDetails.curriculum.empty")}
          </h3>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <GlassCard key={section.id} className="p-5" glow={false}>
          <div className="relative z-10">
            <div className="mb-4">
              <p className="text-xs font-bold text-primary">
                {t("contentDetails.curriculum.section")} {section.order}
              </p>
              <h3 className="mt-1 text-xl font-medium">{section.title}</h3>
              {section.description && (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {section.description}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {(section.lessons ?? []).map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-glass-border bg-background/45 p-4"
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      {lesson.isPreview ? (
                        <PlayCircle className="h-5 w-5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold">{lesson.title}</h4>
                      {lesson.description && (
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                    {lesson.durationMinutes && (
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {lesson.durationMinutes}m
                      </span>
                    )}

                    {!lesson.isPreview && <Lock className="h-3.5 w-3.5" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default CourseCurriculum;
