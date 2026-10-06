import { buildGenerateRequest, type OutboundDrops } from "./service-ai.request";
import { parseRetryAfter, translateErrorEnvelope } from "./service-ai.failure";
import { SERVICE_AI_CONFIG, type ServiceAiConfig } from "./service-ai.config";
import { SERVICE_AI_CONTRACT_VERSION } from "./generated/service-ai.types";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { translateTransportFailure } from "./service-ai.failure";
import { parseGenerateResponse } from "./service-ai.response";
import { parseChatTurnResponse } from "./service-ai.response";
import { notConfiguredFailure } from "./service-ai.failure";
import { buildChatTurnRequest } from "./service-ai.request";
import { withoutEchoedBands } from "./service-ai.translation";
import { CORRELATION_HEADER } from "@infrastructure/observability/correlation-id.middleware";
import { parseErrorEnvelope } from "./service-ai.response";
import { requestContext } from "@infrastructure/observability/request-context";
import { randomUUID } from "crypto";
import {
  type ChatTurnData,
  type ChatTurnInput,
  type GenerateData,
  type GenerateInput,
  type ServiceAiFailure,
  type ServiceAiPort,
  type ServiceAiResult,
} from "./service-ai.port";

export const CHAT_TURN_PATH = "/v1/roadmap/chat-turn";
export const GENERATE_PATH = "/v1/roadmap/generate";

const CONTRACT_VERSION_HEADER = "x-contract-version";

const MODEL_HEADER = "x-model";
const PROVIDER_CORRELATION_HEADER = "x-correlation-id";
const RETRY_AFTER_HEADER = "retry-after";
const TOKEN_HEADERS = {
  promptTokens: ["x-prompt-tokens", "x-tokens-input"],
  completionTokens: ["x-completion-tokens", "x-tokens-output"],
  totalTokens: ["x-total-tokens", "x-tokens-total"],
} as const;

const OPERATION_BY_PATH: Record<string, "chat" | "generate"> = {
  [CHAT_TURN_PATH]: "chat",
  [GENERATE_PATH]: "generate",
};

const majorOf = (version: string) => version.split(".")[0];

const CORRELATION_PATTERN = /^[\w.-]{1,128}$/;

type Delivered =
  | { ok: true; status: number; body: unknown }
  | { ok: false; failure: ServiceAiFailure };

@Injectable()
export class ServiceAiClient implements ServiceAiPort {
  private readonly logger = new Logger(ServiceAiClient.name);
  private reportedContractVersions = new Set<string>();

  constructor(
    @Inject(SERVICE_AI_CONFIG) private readonly config: ServiceAiConfig,
  ) {}

  async chatTurn(input: ChatTurnInput): Promise<ServiceAiResult<ChatTurnData>> {
    const { body, drops } = buildChatTurnRequest(input);
    const delivered = await this.send(
      CHAT_TURN_PATH,
      body,
      this.config.timeouts.chatTurn,
      drops,
    );
    if (!delivered.ok) return delivered.failure;

    const data = parseChatTurnResponse(delivered.body);
    if (!data) return this.rejectResponse(CHAT_TURN_PATH, delivered.status);
    return {
      ok: true,
      data: {
        ...data,
        extracted: withoutEchoedBands(input.draft, data.extracted),
      },
    };
  }

  async generate(input: GenerateInput): Promise<ServiceAiResult<GenerateData>> {
    const { body, drops } = buildGenerateRequest(input);
    const delivered = await this.send(
      GENERATE_PATH,
      body,
      this.config.timeouts.generate,
      drops,
    );
    if (!delivered.ok) return delivered.failure;

    const data = parseGenerateResponse(delivered.body);
    if (!data) return this.rejectResponse(GENERATE_PATH, delivered.status);
    return { ok: true, data };
  }

  private rejectResponse(path: string, status: number): ServiceAiFailure {
    this.logger.error({
      path,
      status,
      event: "roadmap-ai.response-rejected",
      correlationId: this.correlationId(),
      message: "Response did not satisfy contract types.",
    });
    return translateTransportFailure(status);
  }

  private correlationId() {
    const supplied = requestContext.correlationId();
    return supplied && CORRELATION_PATTERN.test(supplied)
      ? supplied
      : randomUUID();
  }

  private checkContractVersion(reported: string | null, path: string) {
    if (!reported || reported === SERVICE_AI_CONTRACT_VERSION) return;
    if (this.reportedContractVersions.has(reported)) return;
    this.reportedContractVersions.add(reported);
    const isIncompatible =
      majorOf(reported) !== majorOf(SERVICE_AI_CONTRACT_VERSION);
    const report = isIncompatible ? this.logger.error : this.logger.warn;
    report.call(this.logger, {
      path,
      reported,
      isIncompatible,
      expected: SERVICE_AI_CONTRACT_VERSION,
      event: "roadmap-ai.contract-version-mismatch",
      message:
        `Roadmap AI Service reports contract ${reported}; this build was ` +
        `generated from ${SERVICE_AI_CONTRACT_VERSION}. Re-vendor the ` +
        `contract and regenerate.`,
    });
  }

  private countHeader(
    headers: Headers,
    names: readonly string[],
  ): number | null {
    for (const name of names) {
      const raw = headers.get(name);
      if (raw && /^\d+$/.test(raw.trim())) return Number(raw.trim());
    }
    return null;
  }

  private async send(
    path: string,
    body: unknown,
    timeoutMs: number,
    drops: OutboundDrops,
  ): Promise<Delivered> {
    const correlationId = this.correlationId();
    const line = {
      path,
      drops,
      correlationId,
      method: "POST",
      operation: OPERATION_BY_PATH[path] ?? null,
      providerCorrelationId: null as string | null,
      model: null as string | null,
      totalTokens: null as number | null,
      promptTokens: null as number | null,
      completionTokens: null as number | null,
      contractVersion: null as string | null,
      event: "roadmap-ai.call",
    };

    if (!this.config.baseUrl || !this.config.serviceToken) {
      this.logger.error({
        ...line,
        status: null,
        durationMs: 0,
        outcome: "unconfigured",
        message:
          "ROADMAP_AI_BASE_URL or ROADMAP_AI_SERVICE_TOKEN is unset; the " +
          "Roadmap AI Service was not called.",
      });
      return { ok: false, failure: notConfiguredFailure() };
    }

    const startedAt = Date.now();
    try {
      const response = await fetch(`${this.config.baseUrl}${path}`, {
        method: "POST",
        signal: AbortSignal.timeout(timeoutMs),
        body: JSON.stringify(body),
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          authorization: `Bearer ${this.config.serviceToken}`,
          [CORRELATION_HEADER]: correlationId,
        },
      });

      line.contractVersion = response.headers.get(CONTRACT_VERSION_HEADER);
      line.model = response.headers.get(MODEL_HEADER);
      line.providerCorrelationId = response.headers.get(
        PROVIDER_CORRELATION_HEADER,
      );
      line.promptTokens = this.countHeader(
        response.headers,
        TOKEN_HEADERS.promptTokens,
      );
      line.completionTokens = this.countHeader(
        response.headers,
        TOKEN_HEADERS.completionTokens,
      );
      line.totalTokens = this.countHeader(
        response.headers,
        TOKEN_HEADERS.totalTokens,
      );
      const retryAfterSeconds = parseRetryAfter(
        response.headers.get(RETRY_AFTER_HEADER),
      );

      const payload: unknown = await response.json().catch(() => undefined);
      const durationMs = Date.now() - startedAt;
      this.checkContractVersion(line.contractVersion, path);

      if (response.ok) {
        this.logger.log({
          ...line,
          durationMs,
          outcome: "ok",
          status: response.status,
        });
        return { ok: true, status: response.status, body: payload };
      }

      const envelope = parseErrorEnvelope(payload);
      const translated = envelope
        ? translateErrorEnvelope(envelope, retryAfterSeconds)
        : translateTransportFailure(response.status, retryAfterSeconds);
      const providerCorrelationId =
        translated.providerCorrelationId ?? line.providerCorrelationId;
      const failure: ServiceAiFailure = {
        ...translated,
        providerCorrelationId,
      };

      this.logger.warn({
        ...line,
        durationMs,
        providerCorrelationId,
        status: response.status,
        outcome: failure.kind,
        retryable: failure.retryable,
        retryAfterSeconds,
        providerCode: envelope?.code ?? null,
      });
      return { ok: false, failure };
    } catch {
      this.logger.warn({
        ...line,
        status: null,
        timeoutMs,
        outcome: "unavailable",
        durationMs: Date.now() - startedAt,
        message: "Roadmap AI Service did not answer.",
      });
      return { ok: false, failure: translateTransportFailure(null) };
    }
  }
}
