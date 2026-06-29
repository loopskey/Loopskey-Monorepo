import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { GoogleAuthGuard } from "@auth/guards/google-auth.guard";
import { TOAuthProfile } from "@auth/types/oauth-service.types";
import { AuthService } from "@auth/services/auth.service";
import { Public } from "@auth/decorators/public.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get("google")
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    return;
  }

  @Public()
  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() request: Request, @Res() response: Response) {
    return this.authService.handleGoogleOAuth(
      request.user as TOAuthProfile,
      response,
    );
  }
}
