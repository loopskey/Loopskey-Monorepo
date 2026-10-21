"use client";

import { ROADMAP_BRIEF_UNAVAILABLE_CODE } from "@/utils/roadmap-edit.constant";
import { ROADMAP_NOT_EDITABLE_CODE } from "@/utils/roadmap-edit.constant";
import { useCallback, useState } from "react";
import { buildRoadmapEditHref } from "@/utils/roadmap-navigation.util";
import { getAuthErrorCode } from "@/utils/graphql-error.util";
import { useRouter } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/professional.api";

const KEY = "professionalDashboard.roadmap.edit";

const failureKey = (code: string | null) => {
  if (code === ROADMAP_NOT_EDITABLE_CODE) return `${KEY}.notEditable`;
  if (code === ROADMAP_BRIEF_UNAVAILABLE_CODE) return `${KEY}.briefUnavailable`;
  return `${KEY}.startFailed`;
};

export const useRoadmapEdit = () => {
  const { t } = useI18n();
  const router = useRouter();
  const [startEdit] = API.useStartRoadmapEditMutation();
  const [editingRoadmapId, setEditingRoadmapId] = useState<string | null>(null);

  const edit = useCallback(
    async (roadmapId: string) => {
      if (editingRoadmapId) return;
      setEditingRoadmapId(roadmapId);
      try {
        const draft = await startEdit(roadmapId).unwrap();
        router.push(buildRoadmapEditHref(draft.id));
      } catch (error: unknown) {
        notify.error(t(failureKey(getAuthErrorCode(error))));
        setEditingRoadmapId(null);
      }
    },
    [editingRoadmapId, router, startEdit, t],
  );

  return { edit, editingRoadmapId };
};
