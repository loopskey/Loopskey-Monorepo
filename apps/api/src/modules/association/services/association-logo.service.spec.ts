import { AssociationLogoService } from "@association/services/association-logo.service";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { MAX_LOGO_SIZE_BYTES } from "@association/enums/association-logo.constant";
import { type ObjectStoragePort } from "@infrastructure/storage/object-storage.port";
import { PrismaService } from "@prisma/prisma.service";
import { Role } from "@prisma/client";

const owner = { id: "owner-1", role: Role.ASSOCIATION };

const association = (overrides: Record<string, unknown> = {}) => ({
  id: "assoc-1",
  name: "Institute",
  logoUrl: null,
  logoStorageKey: null,
  description: null,
  country: null,
  website: null,
  contactEmail: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  settings: null,
  owner: { email: "owner@example.test", fullName: "Owner", status: "ACTIVE" },
  ...overrides,
});

const upload = (overrides: Record<string, unknown> = {}) =>
  ({
    originalname: "logo.png",
    mimetype: "image/png",
    size: 1024,
    buffer: Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3,
    ]),
    ...overrides,
  }) as unknown as Express.Multer.File;

const setup = ({
  previousKey = null,
  updateFails = false,
}: { previousKey?: string | null; updateFails?: boolean } = {}) => {
  const store = jest.fn().mockResolvedValue(undefined);
  const remove = jest.fn().mockResolvedValue(undefined);
  const update = updateFails
    ? jest.fn().mockRejectedValue(new Error("write failed"))
    : jest.fn().mockResolvedValue(association());

  const prisma = {
    association: {
      findUniqueOrThrow: jest
        .fn()
        .mockResolvedValue({ logoStorageKey: previousKey }),
      findFirst: jest.fn().mockResolvedValue({ id: "assoc-1" }),
      update,
    },
    auditLog: { create: jest.fn().mockResolvedValue({ id: "audit-1" }) },
  };

  const access = {
    requireOwned: jest
      .fn()
      .mockResolvedValue({ id: "assoc-1", name: "Institute" }),
  };

  return {
    store,
    remove,
    update,
    service: new AssociationLogoService(
      prisma as unknown as PrismaService,
      access as unknown as AssociationAccessService,
      {
        store,
        remove,
        resolve: jest.fn((_namespace, key: string) => `logos/${key}`),
        exists: jest.fn().mockResolvedValue(true),
        read: jest.fn(),
      } as unknown as ObjectStoragePort,
    ),
  };
};

const codeOf = async (run: Promise<unknown>) => {
  try {
    await run;
    return "NO_ERROR";
  } catch (error) {
    const response = (
      error as { getResponse: () => { code?: string } }
    ).getResponse();
    return response.code;
  }
};

describe("AssociationLogoService", () => {
  it("refuses a file above the shared size limit and stores nothing", async () => {
    const { service, store } = setup();

    expect(
      await codeOf(
        service.upload(owner, upload({ size: MAX_LOGO_SIZE_BYTES + 1 })),
      ),
    ).toBe(AssociationMessageCode.LOGO_TOO_LARGE);

    expect(store).not.toHaveBeenCalled();
  });

  it("refuses a type the shared rules do not accept", async () => {
    const { service, store } = setup();

    expect(
      await codeOf(
        service.upload(
          owner,
          upload({ originalname: "logo.svg", mimetype: "image/svg+xml" }),
        ),
      ),
    ).toBe(AssociationMessageCode.LOGO_INVALID_TYPE);

    expect(store).not.toHaveBeenCalled();
  });

  it("refuses an extension that disagrees with the declared type", async () => {
    const { service, store } = setup();

    expect(
      await codeOf(
        service.upload(
          owner,
          upload({ originalname: "logo.png", mimetype: "image/webp" }),
        ),
      ),
    ).toBe(AssociationMessageCode.LOGO_INVALID_TYPE);

    expect(store).not.toHaveBeenCalled();
  });

  it("stores under a generated key, never the name the client sent", async () => {
    const { service, store, update } = setup();

    await service.upload(owner, upload({ originalname: "../../evil.png" }));

    const [namespace, key] = store.mock.calls[0];

    expect(namespace).toBe("logo");
    expect(key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$/,
    );
    expect(update.mock.calls[0][0].data.logoUrl).toBe(
      `/association/logo/${key}`,
    );
  });

  it("removes the object it just wrote when the row cannot be updated", async () => {
    const { service, store, remove } = setup({ updateFails: true });

    await expect(service.upload(owner, upload())).rejects.toThrow(
      "write failed",
    );

    const [, key] = store.mock.calls[0];

    expect(remove).toHaveBeenCalledWith("logo", key);
  });

  it("deletes the previous object only after the row points at the new one", async () => {
    const { service, store, remove, update } = setup({
      previousKey: "old-key.png",
    });

    await service.upload(owner, upload());

    expect(update).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith("logo", "old-key.png");
    expect(store.mock.invocationCallOrder[0]).toBeLessThan(
      remove.mock.invocationCallOrder[0],
    );
  });

  it("refuses a file whose bytes are not the image its name claims", async () => {
    const { service, store } = setup();

    expect(
      await codeOf(
        service.upload(
          owner,
          upload({ buffer: Buffer.from("GIF89a-actually-a-gif") }),
        ),
      ),
    ).toBe(AssociationMessageCode.LOGO_INVALID_TYPE);

    expect(store).not.toHaveBeenCalled();
  });

  it("accepts a jpeg and a webp by their own signatures", async () => {
    const jpeg = setup();
    await jpeg.service.upload(
      owner,
      upload({
        originalname: "logo.jpg",
        mimetype: "image/jpeg",
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2]),
      }),
    );
    expect(jpeg.store).toHaveBeenCalled();

    const webp = setup();
    await webp.service.upload(
      owner,
      upload({
        originalname: "logo.webp",
        mimetype: "image/webp",
        buffer: Buffer.concat([
          Buffer.from("RIFF", "ascii"),
          Buffer.alloc(4),
          Buffer.from("WEBP", "ascii"),
        ]),
      }),
    );
    expect(webp.store).toHaveBeenCalled();
  });

  it("refuses to serve a key that is not one it could have written", async () => {
    const { service } = setup();

    for (const key of ["../secret.png", "logo.png", "not-a-uuid.png"])
      expect(await codeOf(service.storedPath(key))).toBe(
        AssociationMessageCode.LOGO_NOT_FOUND,
      );
  });
});
