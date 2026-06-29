"use client";

import { AnimatedTabs } from "@elements/animated-tabs";
import { TLearningHubTabsProps } from "@/types/landing-module.types";

const LearningHubTabs = ({
  tabs,
  onChange,
  activeTab,
}: TLearningHubTabsProps) => {
  return (
    <AnimatedTabs
      tabs={tabs}
      activeTab={activeTab}
      onChange={onChange}
      showDescription={false}
    />
  );
};

export default LearningHubTabs;
