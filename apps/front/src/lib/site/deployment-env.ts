export const DEPLOYMENT_ENVIRONMENTS = [
  "development",
  "ci",
  "preview",
  "staging",
  "production",
] as const;

export type DeploymentEnvironment = (typeof DEPLOYMENT_ENVIRONMENTS)[number];

const DEPLOYMENT_ENV_VARIABLE = "DEPLOYMENT_ENV";

const isDeploymentEnvironment = (
  value: string,
): value is DeploymentEnvironment =>
  (DEPLOYMENT_ENVIRONMENTS as readonly string[]).includes(value);

const readDeploymentEnvironment = (): DeploymentEnvironment => {
  const configured = process.env.DEPLOYMENT_ENV?.trim();
  if (!configured)
    return process.env.NODE_ENV === "production" ? "staging" : "development";

  if (!isDeploymentEnvironment(configured))
    throw new Error(
      `Invalid ${DEPLOYMENT_ENV_VARIABLE}: expected one of ` +
        `${DEPLOYMENT_ENVIRONMENTS.join(", ")}.`,
    );

  return configured;
};

export const DEPLOYMENT_ENVIRONMENT = readDeploymentEnvironment();

export const isIndexableDeployment = DEPLOYMENT_ENVIRONMENT === "production";

export const allowsLocalhostOrigin = DEPLOYMENT_ENVIRONMENT === "development";
