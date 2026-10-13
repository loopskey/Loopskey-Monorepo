export const FULL_NAME_LIMITS = {
  min: 2,
  max: 120,
} as const;

export const ASSOCIATION_MEMBER_LIMITS = {
  emailMax: 254,
  notesMax: 2000,
  fullNameMin: 2,
  fullNameMax: 160,
  groupTitleMin: 2,
  bulkRowsMax: 5000,
  memberNumberMax: 64,
  groupTitleMax: 120,
  groupDescriptionMax: 1000,
  requirementsPerMemberMax: 200,
} as const;

export const ASSOCIATION_REQUIREMENT_LIMITS = {
  nameMin: 2,
  nameMax: 200,
  descriptionMax: 2000,
  categoryNameMin: 2,
  categoryNameMax: 120,
  categoriesMax: 20,
  creditsMax: 10000,
  cycleLengthYearsMax: 10,
  gracePeriodDaysMax: 365,
  specificMembersMax: 1000,
  groupsMax: 50,
} as const;

export const ASSOCIATION_GRACE_PERIOD_OPTIONS = [0, 14, 30, 60, 90] as const;

export const ASSOCIATION_SUBMISSION_WINDOW_DAYS = {
  WHOLE_PERIOD: null,
  DAYS_180: 180,
  DAYS_90: 90,
  DAYS_60: 60,
  DAYS_30: 30,
} as const;

export const ASSOCIATION_LEARNING_CONTENT_LIMITS = {
  groupsMax: 50,
  specificMembersMax: 1000,
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

export const CONTENT_SEO_LIMITS = {
  titleMax: 200,
  descriptionMax: 500,
  imageAltMax: 300,
} as const;

export const CONTENT_SLUG_LIMITS = {
  maxLength: 200,
} as const;

export const TOPIC_HUB_LIMITS = {
  titleMax: 120,
  introductionMin: 80,
  introductionMax: 1500,
  guidanceMin: 160,
  guidanceMax: 6000,
  sectionsMax: 8,
  sectionHeadingMax: 120,
  sectionBodyMax: 3000,
  referencesMax: 24,
} as const;

export const PROVIDER_PROFILE_LIMITS = {
  displayNameMax: 120,
  biographyMin: 80,
  biographyMax: 2500,
  websiteMax: 300,
  linksMax: 5,
  linkLabelMax: 60,
  linkUrlMax: 300,
  noteMax: 1000,
} as const;
