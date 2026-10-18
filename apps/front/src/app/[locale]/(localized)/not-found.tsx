"use client";

import dynamic from "next/dynamic";

const NotFoundContent = dynamic(
  () => import("@modules/NotFound/NotFoundContent"),
);

const LocalizedNotFound = () => <NotFoundContent />;

export default LocalizedNotFound;
