import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";

import dynamic from "next/dynamic";

/**
 * Loaded on its own route so the chat, its widgets and the review summary stay
 * out of the shared dashboard shell's first-load bundle.
 *
 * Authentication, the professional role check and the onboarding gate all come
 * from `dashboard/professional/layout.tsx`. Ownership of the draft is enforced
 * by the API — the client never sends an owner identifier.
 */
const ProfessionalRoadmapChatPage = dynamic(
  () =>
    import("@modules/ProfessionalRoadmapChat/ProfessionalRoadmapChatPage").then(
      (module) => module.ProfessionalRoadmapChatPage,
    ),
  { loading: () => <DashboardContentSkeleton /> },
);

const RoadmapChatRoute = () => {
  return <ProfessionalRoadmapChatPage />;
};

export default RoadmapChatRoute;
