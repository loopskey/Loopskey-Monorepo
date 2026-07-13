import { BadRequestException, Injectable } from "@nestjs/common";
import { TOAuthStatePayload } from "@auth/types/oauth-service.types";
import { Request, Response } from "express";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { TOAuthProvider } from "@auth/types/oauth-service.types";
import { ConfigService } from "@nestjs/config";
import { StringValue } from "ms";
import { JwtService } from "@nestjs/jwt";
import { Role } from "@prisma/client";

import * as crypto from "crypto";

export const OAUTH_STATE_TTL: StringValue = "10m";
export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
export const OAUTH_STATE_COOKIE_FALLBACK = "oauth_state";

@Injectable()
export class AuthOAuthStateService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createState(
    role: Role,
    provider: TOAuthProvider,
    response: Response,
  ): Promise<string> {
    const nonce = crypto.randomBytes(32).toString("hex");
    const state = await this.jwtService.signAsync(
      { role, provider, nonce } satisfies TOAuthStatePayload,
      {
        secret: this.getStateSecret(),
        expiresIn: OAUTH_STATE_TTL,
      },
    );
    response.cookie(this.getCookieName(), nonce, {
      ...this.getCookieOptions(),
      maxAge: OAUTH_STATE_TTL_MS,
    });
    return state;
  }

  async verifyState(
    request: Request,
    response: Response,
    expectedProvider: TOAuthProvider,
  ): Promise<Role> {
    const state = request.query.state;
    const cookieNonce = request.cookies?.[this.getCookieName()] as
      | string
      | undefined;
    this.clearStateCookie(response);
    if (typeof state !== "string" || !state) this.throwInvalidState();
    if (!cookieNonce) this.throwInvalidState();
    let payload: TOAuthStatePayload;
    try {
      payload = await this.jwtService.verifyAsync<TOAuthStatePayload>(
        state as string,
        { secret: this.getStateSecret() },
      );
    } catch {
      return this.throwInvalidState();
    }
    if (payload.provider !== expectedProvider) this.throwInvalidState();
    if (!this.isNonceMatch(payload.nonce, cookieNonce as string))
      this.throwInvalidState();
    return payload.role;
  }

  decodeRoleFromState(request: Request): Role | null {
    const state = request.query.state;
    if (typeof state !== "string" || !state) return null;
    try {
      const payload = this.jwtService.verify<TOAuthStatePayload>(state, {
        secret: this.getStateSecret(),
        ignoreExpiration: true,
      });
      return payload.role ?? null;
    } catch {
      return null;
    }
  }

  clearStateCookie(response: Response) {
    response.cookie(this.getCookieName(), "", {
      ...this.getCookieOptions(),
      expires: new Date(0),
      maxAge: 0,
    });
  }

  private isNonceMatch(stateNonce: string, cookieNonce: string) {
    const stateBuffer = Buffer.from(stateNonce ?? "", "utf8");
    const cookieBuffer = Buffer.from(cookieNonce ?? "", "utf8");
    if (stateBuffer.length !== cookieBuffer.length) return false;
    return crypto.timingSafeEqual(stateBuffer, cookieBuffer);
  }

  private throwInvalidState(): never {
    throw new BadRequestException({
      code: AuthMessageCode.OAUTH_INVALID_STATE,
      message: AuthMessageCode.OAUTH_INVALID_STATE,
    });
  }

  private getStateSecret() {
    return (
      this.configService.get<string>("OAUTH_STATE_SECRET") ||
      this.configService.getOrThrow<string>("JWT_ACCESS_SECRET")
    );
  }

  private getCookieName() {
    return this.configService.get<string>(
      "OAUTH_STATE_COOKIE_NAME",
      OAUTH_STATE_COOKIE_FALLBACK,
    );
  }

  private getCookieOptions() {
    return {
      httpOnly: true,
      secure:
        this.configService.get<string>("COOKIE_SECURE", "false") === "true",
      sameSite: this.configService.get<"lax" | "strict" | "none">(
        "COOKIE_SAME_SITE",
        "lax",
      ),
      domain: this.configService.get<string>("COOKIE_DOMAIN") || undefined,
      path: "/",
    };
  }
}
