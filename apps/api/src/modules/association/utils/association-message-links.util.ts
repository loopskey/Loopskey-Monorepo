const REQUIREMENTS_TAB = "cpd-pdu-progress";

const originOf = (origin: string) => origin.replace(/\/+$/, "");

export const professionalDashboardUrl = (origin: string) =>
  `${originOf(origin)}/dashboard/professional`;

export const professionalRequirementsUrl = (
  origin: string,
  requirementId?: string,
) => {
  const params = new URLSearchParams({ tab: REQUIREMENTS_TAB });
  if (requirementId) params.set("requirement", `association:${requirementId}`);
  return `${professionalDashboardUrl(origin)}?${params.toString()}`;
};
