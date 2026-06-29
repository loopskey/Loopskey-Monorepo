import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma, Role, UserStatus } from "@prisma/client";
import { UpdateUserStatusInput } from "@user/dtos/update-user-status.input";
import { UserPaginationInput } from "@user/dtos/user-pagination.input";
import { ForbiddenException } from "@nestjs/common";
import { CreateUserInput } from "@user/dtos/create-user.input";
import { UserMessageCode } from "@user/enums/user-message-code.enum";
import { UserFilterInput } from "@user/dtos/user-filter.input";
import { UpdateUserInput } from "@user/dtos/update-user.input";
import { UpdateMeInput } from "@user/dtos/update-me.input";
import { PrismaService } from "@prisma/prisma.service";

import * as argon2 from "argon2";

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly userSelect = {
    id: true,
    email: true,
    phone: true,
    firstName: true,
    lastName: true,
    fullName: true,
    avatarUrl: true,
    bio: true,
    role: true,
    status: true,
    emailVerifiedAt: true,
    phoneVerifiedAt: true,
    lastLoginAt: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    professionalProfile: true,
    providerProfile: true,
    organizationProfile: true,
  } satisfies Prisma.UserSelect;

  async createUser(input: CreateUserInput) {
    if (!input.email && !input.phone)
      throw new BadRequestException({
        code: UserMessageCode.INVALID_USER_ID,
        message: "Email or phone is required.",
      });
    if (input.email) {
      const emailExists = await this.prismaService.user.findUnique({
        where: { email: input.email.toLowerCase() },
        select: { id: true },
      });
      if (emailExists)
        throw new ConflictException({
          code: UserMessageCode.EMAIL_ALREADY_EXISTS,
          message: "Email already exists.",
        });
    }
    if (input.phone) {
      const phoneExists = await this.prismaService.user.findUnique({
        where: { phone: input.phone },
        select: { id: true },
      });
      if (phoneExists)
        throw new ConflictException({
          code: UserMessageCode.PHONE_ALREADY_EXISTS,
          message: "Phone already exists.",
        });
    }
    const passwordHash = await argon2.hash(input.password);
    const fullName =
      input.fullName ??
      [input.firstName, input.lastName].filter(Boolean).join(" ") ??
      null;
    return this.prismaService.user.create({
      data: {
        email: input.email?.toLowerCase(),
        phone: input.phone,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        avatarUrl: input.avatarUrl,
        fullName,
        role: input.role ?? Role.PROFESSIONAL,
        status: input.status ?? UserStatus.PENDING,
        professionalProfile:
          input.role === Role.PROFESSIONAL || !input.role
            ? {
                create: {
                  interests: [],
                  skills: [],
                },
              }
            : undefined,
        providerProfile:
          input.role === Role.PROVIDER
            ? {
                create: {},
              }
            : undefined,
        organizationProfile:
          input.role === Role.ORGANIZATION
            ? {
                create: {
                  organizationName: fullName || "Organization",
                },
              }
            : undefined,
      },
      select: this.userSelect,
    });
  }

  async me(userId: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: this.userSelect,
    });
    if (!user)
      throw new NotFoundException({
        code: UserMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    return user;
  }

  async findById(userId: string, includeDeleted = false) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      select: this.userSelect,
    });
    if (!user)
      throw new NotFoundException({
        code: UserMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    return user;
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async findUsers(filter?: UserFilterInput, pagination?: UserPaginationInput) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 10;
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {
      ...(filter?.includeDeleted ? {} : { deletedAt: null }),
      ...(filter?.role ? { role: filter.role } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.search
        ? {
            OR: [
              {
                email: {
                  contains: filter.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                phone: {
                  contains: filter.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                firstName: {
                  contains: filter.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                lastName: {
                  contains: filter.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                fullName: {
                  contains: filter.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
    };
    const [items, totalItems] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: this.userSelect,
      }),
      this.prismaService.user.count({ where }),
    ]);
    const totalPages = Math.ceil(totalItems / limit);
    return {
      items,
      pageInfo: {
        totalItems,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async updateMe(userId: string, input: UpdateMeInput) {
    await this.ensureUserExists(userId);
    if (input.phone) await this.ensurePhoneIsUnique(input.phone, userId);
    const fullName =
      input.fullName ??
      [input.firstName, input.lastName].filter(Boolean).join(" ") ??
      undefined;
    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        fullName,
        phone: input.phone,
        avatarUrl: input.avatarUrl,
        bio: input.bio,
      },
      select: this.userSelect,
    });
  }

  async updateUser(input: UpdateUserInput) {
    const user = await this.ensureUserExists(input.userId);
    if (user.deletedAt)
      throw new BadRequestException({
        code: UserMessageCode.CANNOT_UPDATE_DELETED_USER,
        message: "Deleted user cannot be updated.",
      });
    if (input.email) await this.ensureEmailIsUnique(input.email, input.userId);
    if (input.phone) await this.ensurePhoneIsUnique(input.phone, input.userId);
    const fullName =
      input.fullName ??
      [input.firstName, input.lastName].filter(Boolean).join(" ") ??
      undefined;
    return this.prismaService.user.update({
      where: { id: input.userId },
      data: {
        fullName,
        bio: input.bio,
        role: input.role,
        phone: input.phone,
        status: input.status,
        lastName: input.lastName,
        avatarUrl: input.avatarUrl,
        firstName: input.firstName,
        email: input.email?.toLowerCase(),
      },
      select: this.userSelect,
    });
  }

  async updateUserStatus(input: UpdateUserStatusInput) {
    const user = await this.ensureUserExists(input.userId);
    if (user.role === Role.ADMIN && input.status !== UserStatus.ACTIVE)
      throw new ForbiddenException({
        code: UserMessageCode.CANNOT_DELETE_ADMIN_USER,
        message:
          "Admin user cannot be disabled or deleted from this operation.",
      });
    return this.prismaService.user.update({
      where: { id: input.userId },
      data: {
        status: input.status,
      },
      select: this.userSelect,
    });
  }

  async softDeleteUser(userId: string) {
    const user = await this.ensureUserExists(userId);
    if (user.role === Role.ADMIN)
      throw new ForbiddenException({
        code: UserMessageCode.CANNOT_DELETE_ADMIN_USER,
        message: "Admin user cannot be deleted.",
      });
    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.DELETED,
        deletedAt: new Date(),
      },
      select: this.userSelect,
    });
  }

  async restoreUser(userId: string) {
    await this.ensureUserExists(userId, true);
    return this.prismaService.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      select: this.userSelect,
    });
  }

  private async ensureUserExists(userId: string, includeDeleted = false) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
    if (!user)
      throw new NotFoundException({
        code: UserMessageCode.USER_NOT_FOUND,
        message: "User not found.",
      });
    return user;
  }

  private async ensureEmailIsUnique(email: string, currentUserId?: string) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });
    if (existingUser && existingUser.id !== currentUserId)
      throw new ConflictException({
        code: UserMessageCode.EMAIL_ALREADY_EXISTS,
        message: "Email already exists.",
      });
  }

  private async ensurePhoneIsUnique(phone: string, currentUserId?: string) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { phone },
      select: { id: true },
    });
    if (existingUser && existingUser.id !== currentUserId)
      throw new ConflictException({
        code: UserMessageCode.PHONE_ALREADY_EXISTS,
        message: "Phone already exists.",
      });
  }
}
