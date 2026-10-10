import { Suspense } from "react";
import { Skeleton } from "@ui/skeleton";

import OrgActivationCard from "@modules/Auth/OrgActivationCard";
import AuthPageShell from "@modules/Auth/parts/AuthPageSell";

export const metadata = {
  title: "Set your password",
};

const OrgActivatePage = () => {
  return (
    <AuthPageShell>
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-md space-y-5 p-6 sm:p-8">
            <Skeleton className="mx-auto h-14 w-14 rounded-md" />
            <Skeleton className="mx-auto h-6 w-56 rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
            <Skeleton className="h-14 w-full rounded-md" />
          </div>
        }
      >
        <OrgActivationCard />
      </Suspense>
    </AuthPageShell>
  );
};

export default OrgActivatePage;
