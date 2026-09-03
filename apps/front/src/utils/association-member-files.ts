import {
  associationMemberCertificateFileUrl,
  associationMemberEvidenceFileUrl,
} from "@loopskey/api-contracts/upload";

import { PDU_API_ORIGIN } from "@utils/pdu.constant";

export type TAssociationDownloadKind = "evidence" | "certificate";

export const getAssociationMemberFileUrl = (
  kind: TAssociationDownloadKind,
  memberId: string,
  fileId: string,
) =>
  kind === "evidence"
    ? associationMemberEvidenceFileUrl(PDU_API_ORIGIN, memberId, fileId)
    : associationMemberCertificateFileUrl(PDU_API_ORIGIN, memberId, fileId);

export const downloadAssociationMemberFile = async (
  kind: TAssociationDownloadKind,
  memberId: string,
  file: { id: string; fileName: string },
) => {
  const response = await fetch(
    getAssociationMemberFileUrl(kind, memberId, file.id),
    { credentials: "include" },
  );

  if (!response.ok) throw new Error(`Download failed (${response.status})`);

  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};
