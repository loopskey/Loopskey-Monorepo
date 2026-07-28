export const CERTIFICATE_LIMITS = {
  titleMax: 200,
  issuerMax: 200,
  certificateNumberMax: 120,
} as const;

export const isExpiryOnOrAfterIssue = (
  issueDate: string | Date,
  expiryDate: string | Date,
): boolean => {
  const issue = new Date(issueDate).getTime();
  const expiry = new Date(expiryDate).getTime();
  if (Number.isNaN(issue) || Number.isNaN(expiry)) return false;
  return expiry >= issue;
};
