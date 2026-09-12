import {
  BadRequestException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { ProfessionalAvatarService } from "./professional-avatar.service";
import { Role } from "@prisma/client";

const buildFile = (
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File =>
  ({
    fieldname: "file",
    originalname: "avatar.png",
    mimetype: "image/png",
    size: 1024,
    buffer: Buffer.from("fake-image-bytes"),
    ...overrides,
  }) as Express.Multer.File;

describe("ProfessionalAvatarService", () => {
  const user = { id: "user-1", role: Role.PROFESSIONAL };

  const buildService = () => {
    const identity = {
      avatar: jest.fn().mockResolvedValue({ avatarStorageKey: null }),
      setAvatar: jest
        .fn()
        .mockResolvedValue({ id: "user-1", avatarUrl: "/avatar/new.png" }),
      avatarOwner: jest.fn(),
    };
    const storage = {
      store: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockResolvedValue(undefined),
      resolve: jest.fn(),
      exists: jest.fn(),
    };
    const service = new ProfessionalAvatarService(
      identity as never,
      storage as never,
    );
    return { service, identity, storage };
  };

  it("rejects a non-professional, non-admin caller", async () => {
    const { service } = buildService();
    await expect(
      service.uploadAvatar({ id: "u", role: Role.PROVIDER }, buildFile()),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects an unsupported MIME type", async () => {
    const { service } = buildService();
    await expect(
      service.uploadAvatar(user, buildFile({ mimetype: "application/pdf" })),
    ).rejects.toMatchObject({
      response: { message: ProfessionalMessageCode.AVATAR_FILE_INVALID_TYPE },
    });
  });

  it("rejects a file over the size limit", async () => {
    const { service } = buildService();
    await expect(
      service.uploadAvatar(user, buildFile({ size: 6 * 1024 * 1024 })),
    ).rejects.toMatchObject({
      response: { message: ProfessionalMessageCode.AVATAR_FILE_TOO_LARGE },
    });
  });

  it("maps a storage failure to a stable, distinguishable error", async () => {
    const { service, storage } = buildService();
    storage.store.mockRejectedValueOnce(new Error("disk full"));

    const rejection = service.uploadAvatar(user, buildFile());
    await expect(rejection).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(rejection).rejects.toMatchObject({
      response: {
        message: ProfessionalMessageCode.AVATAR_STORAGE_UNAVAILABLE,
      },
    });
  });

  it("cleans up the stored object when the profile update fails", async () => {
    const { service, storage, identity } = buildService();
    identity.setAvatar.mockRejectedValueOnce(new Error("db unavailable"));

    await expect(service.uploadAvatar(user, buildFile())).rejects.toThrow(
      "db unavailable",
    );
    expect(storage.remove).toHaveBeenCalledWith(
      "avatar",
      expect.stringContaining(".png"),
    );
  });

  it("removes the previous avatar object after a successful replacement", async () => {
    const { service, storage, identity } = buildService();
    const previousKey = "11111111-1111-1111-1111-111111111111.png";
    identity.avatar.mockResolvedValueOnce({
      avatarStorageKey: previousKey,
    });

    const result = await service.uploadAvatar(user, buildFile());

    expect(result).toEqual({ id: "user-1", avatarUrl: "/avatar/new.png" });
    expect(storage.remove).toHaveBeenCalledWith("avatar", previousKey);
  });

  it("does not orphan the previous avatar when there is nothing to clean up", async () => {
    const { service, storage } = buildService();
    await service.uploadAvatar(user, buildFile());
    expect(storage.remove).not.toHaveBeenCalled();
  });

  it("reports a missing user as not found", async () => {
    const { service, identity } = buildService();
    identity.avatar.mockResolvedValueOnce(null);
    await expect(
      service.uploadAvatar(user, buildFile()),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects an upload with no file", async () => {
    const { service } = buildService();
    await expect(service.uploadAvatar(user)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
