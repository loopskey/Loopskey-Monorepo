import { Injectable, OnModuleInit } from "@nestjs/common";
import {
  authSecretProblems,
  cookiePolicyProblems,
} from "@auth/utils/auth-secrets.util";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthConfigValidator implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const source = {
      get: (key: string) => this.configService.get<string>(key),
    };
    const isProduction =
      this.configService.get<string>("NODE_ENV") === "production";
    const problems = [
      ...authSecretProblems(source, isProduction),
      ...cookiePolicyProblems(source, isProduction),
    ];
    if (problems.length > 0)
      throw new Error(
        `Invalid authentication configuration: ${problems.join(" ")}`,
      );
  }
}
