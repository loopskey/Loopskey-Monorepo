import { type IdentityProfileApi } from "@user/public/identity-profile-api";
import { ProviderProjectionApi } from "@provider/public/provider-projection-api";
import { IDENTITY_PROFILE_API } from "@user/public/identity-profile-api";
import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class ProviderProjectionApiService implements ProviderProjectionApi {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(IDENTITY_PROFILE_API) private readonly identity: IdentityProfileApi,
  ) {}

  async names(providerIds: string[]) {
    const ids = [...new Set(providerIds)];
    const profiles = await this.prisma.providerProfile.findMany({
      where: { userId: { in: ids } },
      select: { userId: true, organizationName: true },
    });
    const organizations = new Map(
      profiles.map((item) => [item.userId, item.organizationName]),
    );
    const identities = await Promise.all(
      ids.map((id) => this.identity.display(id)),
    );
    return Object.fromEntries(
      ids.map((id, index) => [
        id,
        organizations.get(id) ??
          identities[index]?.fullName ??
          identities[index]?.email ??
          null,
      ]),
    );
  }
}
