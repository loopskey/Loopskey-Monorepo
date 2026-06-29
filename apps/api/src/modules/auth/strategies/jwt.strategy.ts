import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { AuthMessageCode } from "@auth/enums/message-code.enum";
import { cookieExtractor } from "@utils/cookie-extractor";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";
import { JwtPayload } from "@auth/types/jwt-payload.type";
import { UserStatus } from "@prisma/client";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user)
      throw new UnauthorizedException({
        code: AuthMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });

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
    };
  }
}
