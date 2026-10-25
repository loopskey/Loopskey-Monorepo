import { refreshAccessToken } from "@/lib/graphql/request";

export type FileRequestFailure =
  | "unauthorized"
  | "missing"
  | "tooLarge"
  | "rejected"
  | "network"
  | "generic";

const UNAUTHORIZED_STATUS = 401;

export class FileRequestError extends Error {
  constructor(
    readonly kind: FileRequestFailure,
    readonly status: number | null,
  ) {
    super(`File request failed (${status ?? kind})`);
    this.name = "FileRequestError";
  }
}

const failureFor = (status: number): FileRequestFailure => {
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 404 || status === 410) return "missing";
  if (status === 413) return "tooLarge";
  if (status === 400 || status === 415 || status === 422) return "rejected";
  return "generic";
};

const send = async (url: string, init: RequestInit) => {
  try {
    return await fetch(url, { ...init, credentials: "include" });
  } catch {
    throw new FileRequestError("network", null);
  }
};

export const fetchWithSession = async (url: string, init: RequestInit = {}) => {
  const response = await send(url, init);
  if (response.status !== UNAUTHORIZED_STATUS) return response;
  if (!(await refreshAccessToken())) return response;
  return send(url, init);
};

export const requestFile = async (url: string, init: RequestInit = {}) => {
  const response = await fetchWithSession(url, init);
  if (!response.ok)
    throw new FileRequestError(failureFor(response.status), response.status);
  return response;
};

export const fileRequestFailureOf = (error: unknown): FileRequestFailure =>
  error instanceof FileRequestError ? error.kind : "generic";

export const fileRequestErrorKey = (error: unknown) =>
  `common.fileRequest.${fileRequestFailureOf(error)}`;

export const saveBlobAs = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};
