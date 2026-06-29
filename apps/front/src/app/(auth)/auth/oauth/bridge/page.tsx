import { Suspense } from "react";

import OAuthBridgeClient from "@modules/Auth/OAuthBridgeClient";

const OAuthBridgePage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Redirecting...
        </div>
      }
    >
      <OAuthBridgeClient />
    </Suspense>
  );
};

export default OAuthBridgePage;
