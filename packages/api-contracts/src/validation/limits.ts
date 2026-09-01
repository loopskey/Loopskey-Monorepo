export const ASSOCIATION_MEMBER_LIMITS = {
  emailMax: 254,
  notesMax: 2000,
  fullNameMin: 2,
  fullNameMax: 160,
  groupTitleMin: 2,
  bulkRowsMax: 1000,
  memberNumberMax: 64,
  groupTitleMax: 120,
  groupDescriptionMax: 1000,
} as const;

export const ASSOCIATION_LIMITS = {
  nameMin: 2,
  nameMax: 160,
  representativeNameMin: 2,
  representativeNameMax: 120,
  descriptionMax: 2000,
  countryMax: 100,
  websiteMax: 300,
  logoUrlMax: 500,
  emailMax: 254,
  thresholdMin: 1,
  thresholdMax: 100,
} as const;

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
