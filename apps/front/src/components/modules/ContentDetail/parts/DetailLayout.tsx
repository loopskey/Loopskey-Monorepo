import { TDetailLayoutProps } from "@/types/content-module.types";

const DetailLayout = ({ header, sidebar, children }: TDetailLayoutProps) => (
  <main className="px-4 py-8 sm:px-6 lg:px-8">
    <div className="mx-auto grid max-w-7xl gap-y-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-[auto_1fr] lg:gap-x-12">
      <div className="lg:col-start-1 lg:row-start-1">{header}</div>
      <div className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        {sidebar}
      </div>
      <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-start-2">
        {children}
      </div>
    </div>
  </main>
);

export default DetailLayout;
