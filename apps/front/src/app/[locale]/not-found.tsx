"use client";

import dynamic from "next/dynamic";

const StandaloneNotFound = dynamic(
  () => import("@modules/NotFound/StandaloneNotFound"),
);

const NotFoundPage = () => <StandaloneNotFound />;

export default NotFoundPage;
