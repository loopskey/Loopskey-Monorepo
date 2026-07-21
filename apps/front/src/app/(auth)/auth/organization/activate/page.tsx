import { Suspense } from "react";
import { Loader2 } from "lucide-react";

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
          <div className="flex min-h-56 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        }
      >
        <OrgActivationCard />
      </Suspense>
    </AuthPageShell>
  );
};

export default OrgActivatePage;
