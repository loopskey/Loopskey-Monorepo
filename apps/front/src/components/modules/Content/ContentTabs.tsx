"use client";

import { TContentTabsProps } from "@/types/content-module.types";
import { TContentTab } from "@/types/content-module.types";

import * as Tb from "@ui/tabs";

const ContentTabs = ({
  label,
  tabs,
  onChange,
  activeTab,
}: TContentTabsProps) => {
  return (
    <Tb.Tabs
      value={activeTab}
      className="w-full sm:w-auto"
      onValueChange={(value) => onChange(value as TContentTab)}
    >
      <Tb.TabsList
        aria-label={label}
        className="grid h-10 w-full grid-cols-4 rounded-lg sm:inline-flex sm:w-auto"
      >
        {tabs.map((tab) => (
          <Tb.TabsTrigger
            key={tab.value}
            value={tab.value}
            className="px-3 font-semibold text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-5"
          >
            {tab.label}
          </Tb.TabsTrigger>
        ))}
      </Tb.TabsList>
    </Tb.Tabs>
  );
};

export default ContentTabs;
