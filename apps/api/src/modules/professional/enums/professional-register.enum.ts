import { ProfileSectionKey } from "@professional/enums/profile-section.enum";
import { registerEnumType } from "@nestjs/graphql";

import * as Prisma from "@prisma/client";

registerEnumType(ProfileSectionKey, { name: "ProfileSectionKey" });
registerEnumType(Prisma.SkillLevel, { name: "SkillLevel" });
registerEnumType(Prisma.LearningFormat, { name: "LearningFormat" });
registerEnumType(Prisma.ExperienceRange, { name: "ExperienceRange" });
registerEnumType(Prisma.ProfileTermUsage, { name: "ProfileTermUsage" });
registerEnumType(Prisma.ProfileTaxonomyKind, { name: "ProfileTaxonomyKind" });
registerEnumType(Prisma.ProfessionalIndustry, {
  name: "ProfessionalIndustry",
});
registerEnumType(Prisma.LearningTimeCommitment, {
  name: "LearningTimeCommitment",
});
registerEnumType(Prisma.LearningBudgetPreference, {
  name: "LearningBudgetPreference",
});

registerEnumType(Prisma.AppTheme, { name: "Theme" });
registerEnumType(Prisma.PDUSource, { name: "PDUSource" });
registerEnumType(Prisma.PDUStatus, { name: "PDUStatus" });
registerEnumType(Prisma.AppLanguage, { name: "AppLanguage" });
registerEnumType(Prisma.RoadmapStatus, { name: "RoadmapStatus" });
registerEnumType(Prisma.PaymentStatus, { name: "PaymentStatus" });
registerEnumType(Prisma.ProfileVisibility, { name: "ProfileVisibility" });
registerEnumType(Prisma.CertificateStatus, { name: "CertificateStatus" });
registerEnumType(Prisma.RoadmapEnrollmentStatus, {
  name: "RoadmapEnrollmentStatus",
});
registerEnumType(Prisma.EventRegistrationStatus, {
  name: "EventRegistrationStatus",
});
registerEnumType(Prisma.ContentEnrollmentStatus, {
  name: "ContentEnrollmentStatus",
});
registerEnumType(Prisma.SessionStatus, {
  name: "SessionStatus",
});
registerEnumType(Prisma.UserStatus, {
  name: "UserStatus",
});
registerEnumType(Prisma.Role, {
  name: "Role",
});
registerEnumType(Prisma.ContentType, {
  name: "ContentType",
});
registerEnumType(Prisma.PDUCategory, {
  name: "PDUCategory",
});

registerEnumType(Prisma.CreditType, {
  name: "CreditType",
});

registerEnumType(Prisma.PDUCompletionStatus, {
  name: "PDUCompletionStatus",
});

registerEnumType(Prisma.CPDPlanStatus, { name: "CPDPlanStatus" });
registerEnumType(Prisma.CPDEvidenceType, { name: "CPDEvidenceType" });
registerEnumType(Prisma.CPDReminderTiming, { name: "CPDReminderTiming" });
registerEnumType(Prisma.CPDReportRecipientType, {
  name: "CPDReportRecipientType",
});

registerEnumType(Prisma.CalendarEventType, {
  name: "CalendarEventType",
});

registerEnumType(Prisma.RoadmapStatus, {
  name: "RoadmapStatus",
});

registerEnumType(Prisma.RoadmapEnrollmentStatus, {
  name: "RoadmapEnrollmentStatus",
});
