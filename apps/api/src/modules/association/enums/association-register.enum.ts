import { AssociationLearningContentStatus } from "@prisma/client";
import { AssociationLearningExternalType } from "@prisma/client";
import { AssociationMessageDeliveryState } from "@prisma/client";
import { AssociationGeneratedReportState } from "@prisma/client";
import { AssociationLateSubmissionPolicy } from "@prisma/client";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationMessageSkipReason } from "@association/enums/association-attention.enum";
import { AssociationAttributionState } from "@prisma/client";
import { AssociationSubmissionWindow } from "@prisma/client";
import { AssociationRenewalCondition } from "@prisma/client";
import { AssociationAttentionSection } from "@association/enums/association-attention.enum";
import { AssociationMemberJoinedVia } from "@prisma/client";
import { AssociationReportingCycle } from "@prisma/client";
import { AssociationComplianceBand } from "@prisma/client";
import { AssociationEvidencePolicy } from "@prisma/client";
import { AssociationReportPeriod } from "@association/utils/association-report-period.util";
import { AssociationReportFormat } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import { AssociationAudienceKind } from "@prisma/client";
import { AssociationMessageType } from "@prisma/client";
import { AssociationReportType } from "@prisma/client";
import { registerEnumType } from "@nestjs/graphql";

export enum AssociationInviteOutcome {
  LINKED_EXISTING_USER = "LINKED_EXISTING_USER",
  INVITATION_SENT = "INVITATION_SENT",
  INVITATION_COOLDOWN = "INVITATION_COOLDOWN",
}

registerEnumType(AssociationMemberStatus, {
  name: "AssociationMemberStatus",
  description: "Where a member stands between invitation and membership",
});

registerEnumType(AssociationMemberJoinedVia, {
  name: "AssociationMemberJoinedVia",
  description: "How a member came to join the association's roster",
});

registerEnumType(AssociationInviteOutcome, {
  name: "AssociationInviteOutcome",
  description:
    "Whether an invitation linked an account that already existed or sent a new one",
});

registerEnumType(AssociationRequirementStatus, {
  name: "AssociationRequirementStatus",
  description:
    "Where a requirement stands in its draft, published, archived life",
});

registerEnumType(AssociationReportingCycle, {
  name: "AssociationReportingCycle",
  description: "How often a requirement's obligation repeats",
});

registerEnumType(AssociationAudienceKind, {
  name: "AssociationAudienceKind",
  description: "Which members a requirement applies to",
});

registerEnumType(AssociationEvidencePolicy, {
  name: "AssociationEvidencePolicy",
  description:
    "Whether members must attach evidence, and whether it is reviewed",
});

registerEnumType(AssociationSubmissionWindow, {
  name: "AssociationSubmissionWindow",
  description:
    "When a requirement's submission window opens, relative to its deadline",
});

registerEnumType(AssociationLateSubmissionPolicy, {
  name: "AssociationLateSubmissionPolicy",
  description: "Whether a submission after the deadline is accepted, and how",
});

registerEnumType(AssociationRenewalCondition, {
  name: "AssociationRenewalCondition",
  description: "What must be true for a requirement to count as renewed",
});

registerEnumType(AssociationComplianceBand, {
  name: "AssociationComplianceBand",
  description: "How far a member has got against what was required of them",
});

registerEnumType(AssociationAttributionState, {
  name: "AssociationAttributionState",
  description:
    "Whether one activity counted toward a requirement, waits on a decision, or was rejected",
});

registerEnumType(AssociationLearningContentStatus, {
  name: "AssociationLearningContentStatus",
  description: "Whether a library item is a draft, published, or withdrawn",
});

registerEnumType(AssociationLearningExternalType, {
  name: "AssociationLearningExternalType",
  description:
    "The kind of content an external (non-catalogue) library item is, chosen by the association",
});

registerEnumType(AssociationReportPeriod, {
  name: "AssociationReportPeriod",
  description: "The period a report covers, as a preset or an explicit range",
});

registerEnumType(AssociationReportType, {
  name: "AssociationReportType",
  description: "Which of the six reports an export renders",
});

registerEnumType(AssociationReportFormat, {
  name: "AssociationReportFormat",
  description:
    "Whether an export is a branded document for circulation or a workbook for analysis",
});

registerEnumType(AssociationGeneratedReportState, {
  name: "AssociationGeneratedReportState",
  description:
    "Whether an export is being generated, ready to download, failed, or past its retention",
});

registerEnumType(AssociationAttentionSection, {
  name: "AssociationAttentionSection",
  description: "Which attention list a row or a send belongs to",
});

registerEnumType(AssociationMessageType, {
  name: "AssociationMessageType",
  description:
    "Which templated message the platform sends on the association's behalf",
});

registerEnumType(AssociationMessageDeliveryState, {
  name: "AssociationMessageDeliveryState",
  description: "Where one recipient's copy of a message stands",
});

registerEnumType(AssociationMessageSkipReason, {
  name: "AssociationMessageSkipReason",
  description: "Why a member in the audience was deliberately not written to",
});
