const PDU_ACTIVITIES_ROUTE = "professional/pdu-activities";
const CERTIFICATES_ROUTE = "professional/certificates";

const join = (origin: string, path: string) =>
  `${origin.replace(/\/+$/, "")}/${path}`;

export const pduEvidenceUploadUrl = (origin: string, activityId: string) =>
  join(
    origin,
    `${PDU_ACTIVITIES_ROUTE}/${encodeURIComponent(activityId)}/files`,
  );

export const pduEvidenceFileUrl = (origin: string, fileId: string) =>
  join(origin, `${PDU_ACTIVITIES_ROUTE}/files/${encodeURIComponent(fileId)}`);

export const certificateEvidenceUploadUrl = (
  origin: string,
  certificateId: string,
) =>
  join(
    origin,
    `${CERTIFICATES_ROUTE}/${encodeURIComponent(certificateId)}/files`,
  );

export const certificateEvidenceFileUrl = (origin: string, fileId: string) =>
  join(origin, `${CERTIFICATES_ROUTE}/files/${encodeURIComponent(fileId)}`);

export const ASSOCIATION_MEMBER_FILES_ROUTE = "association/members";

export const associationMemberEvidenceFileUrl = (
  origin: string,
  memberId: string,
  fileId: string,
) =>
  join(
    origin,
    `${ASSOCIATION_MEMBER_FILES_ROUTE}/${encodeURIComponent(memberId)}/evidence/${encodeURIComponent(fileId)}`,
  );

export const associationMemberCertificateFileUrl = (
  origin: string,
  memberId: string,
  fileId: string,
) =>
  join(
    origin,
    `${ASSOCIATION_MEMBER_FILES_ROUTE}/${encodeURIComponent(memberId)}/certificate/${encodeURIComponent(fileId)}`,
  );
