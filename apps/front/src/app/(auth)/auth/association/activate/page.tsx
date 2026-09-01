import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import AssociationActivationCard from "@modules/Auth/AssociationActivationCard";
import AuthPageShell from "@modules/Auth/parts/AuthPageSell";

export const metadata = {
  title: "Set your password",
};

const AssociationActivatePage = () => {
  return (
    <AuthPageShell>
      <Suspense
        fallback={
          <div className="flex min-h-56 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        }
      >
        <AssociationActivationCard />
      </Suspense>
    </AuthPageShell>
  );
};

export default AssociationActivatePage;
