import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { cookieExtractorFor } from "@utils/cookie-extractor";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";
import { JwtPayload } from "@auth/types/jwt-payload.type";
import { SessionStatus, UserStatus } from "@prisma/client";
import {
  ACCESS_TOKEN_COOKIE_DEFAULT,
  JWT_ACCESS_AUDIENCE,
  JWT_ALGORITHM,
  JWT_ISSUER,
  TOKEN_TYPE,
} from "@loopskey/api-contracts/auth";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractorFor(
          configService.get<string>("ACCESS_TOKEN_COOKIE_NAME") ??
            ACCESS_TOKEN_COOKIE_DEFAULT,
        ),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
      issuer: JWT_ISSUER,
      audience: JWT_ACCESS_AUDIENCE,
      algorithms: [JWT_ALGORITHM],
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (
      payload.tokenType !== TOKEN_TYPE.ACCESS ||
      !isNonEmptyString(payload.sub) ||
      !isNonEmptyString(payload.sessionId)
    )
      throw new UnauthorizedException({
        code: AuthMessageCode.SESSION_NOT_FOUND,
        message: "Session not found.",
      });

    const session = await this.prisma.authSession.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.sub,
        status: SessionStatus.ACTIVE,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        user: { deletedAt: null },
      },
      select: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            forcePasswordChange: true,
          },
        },
      },
    });

    if (!session)
      throw new UnauthorizedException({
        code: AuthMessageCode.SESSION_NOT_FOUND,
        message: "Session not found.",
      });

    const { user } = session;

    if (user.status !== UserStatus.ACTIVE)
      throw new UnauthorizedException({
        code: AuthMessageCode.USER_DISABLED,
        message: "User is not active.",
      });

    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      sessionId: payload.sessionId,
      forcePasswordChange: user.forcePasswordChange,
    };
  }
}
