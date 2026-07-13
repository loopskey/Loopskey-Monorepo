import { OAuthCallbackExceptionFilter } from "@auth/filters/oauth-callback.filter";
import { Controller, Get, Query, Req } from "@nestjs/common";
import { Res, UseFilters, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { LinkedInAuthGuard } from "@auth/guards/linkedin-auth.guard";
import { GoogleAuthGuard } from "@auth/guards/google-auth.guard";
import { TOAuthProfile } from "@auth/types/oauth-service.types";
import { AuthService } from "@auth/services/auth.service";
import { Public } from "@auth/decorators/public.decorator";
import { Role } from "@prisma/client";

@Public()
@UseFilters(OAuthCallbackExceptionFilter)
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("google")
  async googleLogin(@Query("role") role: Role, @Res() response: Response) {
    const { url } = await this.authService.googleOAuthUrl(role, response);
    return response.redirect(url);
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() request: Request, @Res() response: Response) {
    return this.authService.handleGoogleOAuth(
      request.user as TOAuthProfile,
      response,
    );
  }

  @Get("linkedin")
  async linkedinLogin(@Query("role") role: Role, @Res() response: Response) {
    const { url } = await this.authService.linkedinOAuthUrl(role, response);
    return response.redirect(url);
  }

  @Get("linkedin/callback")
  @UseGuards(LinkedInAuthGuard)
  linkedinCallback(@Req() request: Request, @Res() response: Response) {
    return this.authService.handleLinkedInOAuth(
      request.user as TOAuthProfile,
      response,
    );
  }
}
