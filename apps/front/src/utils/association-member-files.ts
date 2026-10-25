import {
  associationMemberCertificateFileUrl,
  associationMemberEvidenceFileUrl,
} from "@loopskey/api-contracts/upload";

import { requestFile, saveBlobAs } from "@utils/file-request.util";
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
  const response = await requestFile(
    getAssociationMemberFileUrl(kind, memberId, file.id),
  );
  saveBlobAs(await response.blob(), file.fileName);
};
