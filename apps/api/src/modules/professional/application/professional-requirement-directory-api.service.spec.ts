import type { PrismaService } from "@prisma/prisma.service";

import { ProfessionalRequirementDirectoryApiService } from "./professional-requirement-directory-api.service";

const setup = () => {
  const prisma = {
    professionalAssociationRequirementLink: {
      deleteMany: jest.fn().mockReturnValue("delete"),
      createMany: jest.fn().mockReturnValue("create"),
    },
    $transaction: jest.fn().mockResolvedValue([]),
  };

  return {
    prisma,
    service: new ProfessionalRequirementDirectoryApiService(
      prisma as unknown as PrismaService,
    ),
  };
};

describe("ProfessionalRequirementDirectoryApiService", () => {
  it("adds links with a conflict-tolerant insert, so concurrent syncs converge", async () => {
    const { service, prisma } = setup();

    await service.syncAssignedRequirements("user-1", [
      "req-1",
      "req-2",
      "req-1",
    ]);

    expect(
      prisma.professionalAssociationRequirementLink.createMany,
    ).toHaveBeenCalledWith({
      data: [
        { userId: "user-1", associationRequirementId: "req-1" },
        { userId: "user-1", associationRequirementId: "req-2" },
      ],
      skipDuplicates: true,
    });
    expect(prisma.$transaction).toHaveBeenCalledWith(["delete", "create"]);
  });

  it("drops the links the member no longer holds in the same transaction", async () => {
    const { service, prisma } = setup();

    await service.syncAssignedRequirements("user-1", ["req-2"]);

    expect(
      prisma.professionalAssociationRequirementLink.deleteMany,
    ).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        associationRequirementId: { notIn: ["req-2"] },
      },
    });
  });
});
