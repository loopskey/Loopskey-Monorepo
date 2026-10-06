import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";

import dynamic from "next/dynamic";

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
