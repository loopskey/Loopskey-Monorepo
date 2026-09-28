import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { TUser } from "@common/types/user.types";

import * as P from "@prisma/client";
import * as C from "@professional/enums/profile-section.enum";
import * as U from "@professional/utils/profile-taxonomy.util";

export type TaxonomyTermsQuery = {
  kind: P.ProfileTaxonomyKind;
  groupKey?: string | null;
  search?: string | null;
  cursor?: string | null;
  take?: number | null;
};

export type CurrentRoleChoice = {
  currentRoleTermId?: string | null;
  currentRole?: string | null;
};

export type SkillSuggestions = {
  isFallback: boolean;
  items: U.TaxonomyTerm[];
};

const SKILL_USAGES = [
  P.ProfileTermUsage.MAIN_SKILL,
  P.ProfileTermUsage.SKILL_TO_IMPROVE,
];

const ROLE_CANDIDATES_PER_GROUP = 12;

const ROLE_CANDIDATES_BY_TEXT = 24;

const ROLE_CANDIDATE_TEXT_MAX_LENGTH = 120;

const FAVORED_ROLE_GROUPS_FROM_SKILLS = 3;

const nonSpaceLength = (value: string) => value.replace(/\s/g, "").length;

const interleave = <T>(lists: readonly T[][], limit: number) => {
  const result: T[] = [];
  for (let index = 0; result.length < limit; index += 1) {
    const round = lists.filter((list) => index < list.length);
    if (!round.length) break;
    for (const list of round) {
      if (result.length >= limit) break;
      result.push(list[index]);
    }
  }
  return result;
};

@Injectable()
export class ProfessionalTaxonomyService {
  constructor(private readonly prisma: PrismaService) {}

  private assertProfessional(user: TUser) {
    if (user.role !== P.Role.PROFESSIONAL && user.role !== P.Role.ADMIN)
      throw new ForbiddenException(
        ProfessionalMessageCode.PROFESSIONAL_ACCESS_REQUIRED,
      );
  }

  async groups(user: TUser, kind: P.ProfileTaxonomyKind) {
    this.assertProfessional(user);
    const groups = await this.prisma.profileTaxonomyGroup.findMany({
      where: { kind, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
      select: {
        id: true,
        kind: true,
        key: true,
        label: true,
        sortOrder: true,
        _count: { select: { terms: { where: { isActive: true } } } },
      },
    });
    return groups
      .filter((group) => group._count.terms > 0)
      .map(({ _count, ...group }) => ({ ...group, termCount: _count.terms }));
  }

  async terms(user: TUser, query: TaxonomyTermsQuery) {
    this.assertProfessional(user);
    const search = U.normalizeTaxonomySearch(query.search);
    if (search && nonSpaceLength(search) < C.TAXONOMY_SEARCH_MIN_LENGTH)
      throw new BadRequestException(
        ProfessionalMessageCode.PROFILE_TAXONOMY_SEARCH_TOO_SHORT,
      );

    const take = Math.min(
      Math.max(query.take ?? C.TAXONOMY_PAGE_DEFAULT, 1),
      C.TAXONOMY_PAGE_MAX,
    );
    const empty = {
      items: [] as U.TaxonomyTerm[],
      totalCount: 0,
      pageInfo: { hasNextPage: false, nextCursor: null as string | null },
    };

    let groupId: string | undefined;
    if (query.groupKey) {
      const group = await this.prisma.profileTaxonomyGroup.findUnique({
        where: { kind_key: { kind: query.kind, key: query.groupKey } },
        select: { id: true, isActive: true },
      });
      if (!group?.isActive) return empty;
      groupId = group.id;
    }

    const where: P.Prisma.ProfileTaxonomyTermWhereInput = {
      kind: query.kind,
      isActive: true,
      ...(groupId ? { groupId } : {}),
      ...(search ? { label: { contains: search, mode: "insensitive" } } : {}),
    };

    const [rows, totalCount] = await Promise.all([
      this.prisma.profileTaxonomyTerm.findMany({
        where,
        take: take + 1,
        orderBy: U.TAXONOMY_TERM_ORDER,
        select: U.TAXONOMY_TERM_SELECT,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      }),
      this.prisma.profileTaxonomyTerm.count({ where }),
    ]);

    const hasNextPage = rows.length > take;
    const items = rows.slice(0, take).map(U.toTaxonomyTerm);
    return {
      items,
      totalCount,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? (items.at(-1)?.id ?? null) : null,
      },
    };
  }

  async termsByIds(user: TUser, ids: readonly string[]) {
    this.assertProfessional(user);
    const unique = [...new Set(ids)];
    if (unique.length > C.TAXONOMY_HYDRATE_MAX)
      throw new BadRequestException(
        ProfessionalMessageCode.PROFILE_TAXONOMY_TERM_INVALID,
      );
    if (!unique.length) return [];
    const rows = await this.prisma.profileTaxonomyTerm.findMany({
      where: { id: { in: unique } },
      select: U.TAXONOMY_TERM_SELECT,
    });
    const byId = new Map(rows.map((row) => [row.id, U.toTaxonomyTerm(row)]));
    return unique.flatMap((id) => {
      const term = byId.get(id);
      return term ? [term] : [];
    });
  }

  async skillSuggestions(
    user: TUser,
    roleTermId?: string | null,
  ): Promise<SkillSuggestions> {
    this.assertProfessional(user);
    return this.suggestSkills(roleTermId, C.SKILL_SUGGESTION_LIMIT);
  }

  async suggestSkills(
    roleTermId: string | null | undefined,
    limit: number,
  ): Promise<SkillSuggestions> {
    const mapped = roleTermId ? await this.mappedSkills(roleTermId, limit) : [];
    if (mapped.length) return { isFallback: false, items: mapped };
    return { isFallback: true, items: await this.popularSkills(limit) };
  }

  private async mappedSkills(roleTermId: string, limit: number) {
    const role = await this.prisma.profileTaxonomyTerm.findFirst({
      where: {
        id: roleTermId,
        kind: P.ProfileTaxonomyKind.ROLE,
        isActive: true,
      },
      select: { groupId: true },
    });
    if (!role) return [];

    const mappings = await this.prisma.profileTaxonomyGroupMapping.findMany({
      where: {
        roleGroupId: role.groupId,
        isActive: true,
        skillGroup: { isActive: true },
      },
      orderBy: [{ priority: "asc" }, { skillGroupId: "asc" }],
      select: { skillGroupId: true },
    });
    if (!mappings.length) return [];

    const perGroup = await Promise.all(
      mappings.map((mapping) =>
        this.prisma.profileTaxonomyTerm.findMany({
          where: {
            groupId: mapping.skillGroupId,
            kind: P.ProfileTaxonomyKind.SKILL_AREA,
            isActive: true,
          },
          orderBy: U.TAXONOMY_TERM_ORDER,
          take: limit,
          select: U.TAXONOMY_TERM_SELECT,
        }),
      ),
    );
    return interleave(perGroup, limit).map(U.toTaxonomyTerm);
  }

  private async popularSkills(limit: number) {
    const popular = await this.prisma.professionalProfileTerm.groupBy({
      by: ["termId"],
      where: {
        usage: { in: SKILL_USAGES },
        term: { kind: P.ProfileTaxonomyKind.SKILL_AREA, isActive: true },
      },
      _count: { termId: true },
      orderBy: [{ _count: { termId: "desc" } }, { termId: "asc" }],
      take: limit,
    });
    const popularIds = popular.map((row) => row.termId);

    const [ranked, filler] = await Promise.all([
      this.prisma.profileTaxonomyTerm.findMany({
        where: { id: { in: popularIds } },
        select: U.TAXONOMY_TERM_SELECT,
      }),
      popularIds.length < limit
        ? this.prisma.profileTaxonomyTerm.findMany({
            where: {
              kind: P.ProfileTaxonomyKind.SKILL_AREA,
              isActive: true,
              id: { notIn: popularIds },
            },
            orderBy: U.TAXONOMY_TERM_ORDER,
            take: limit - popularIds.length,
            select: U.TAXONOMY_TERM_SELECT,
          })
        : Promise.resolve([]),
    ]);
    const byId = new Map(ranked.map((row) => [row.id, row]));
    return [
      ...popularIds.flatMap((id) => {
        const row = byId.get(id);
        return row ? [row] : [];
      }),
      ...filler,
    ].map(U.toTaxonomyTerm);
  }

  async resolveCurrentRole(choice: CurrentRoleChoice) {
    const custom = U.normalizeTaxonomySearch(choice.currentRole);
    if (choice.currentRoleTermId && custom)
      throw new BadRequestException(
        ProfessionalMessageCode.PROFILE_CURRENT_ROLE_CONFLICT,
      );

    if (choice.currentRoleTermId) {
      const term = await this.prisma.profileTaxonomyTerm.findFirst({
        where: {
          id: choice.currentRoleTermId,
          kind: P.ProfileTaxonomyKind.ROLE,
          isActive: true,
        },
        select: { id: true, label: true },
      });
      if (!term)
        throw new BadRequestException(
          ProfessionalMessageCode.PROFILE_TAXONOMY_TERM_INVALID,
        );
      return { currentRole: term.label, currentRoleTermId: term.id };
    }

    return { currentRole: custom || null, currentRoleTermId: null };
  }

  async roleCandidates({
    text,
    favoredGroupIds,
    includeIds = [],
  }: {
    text: string | null | undefined;
    favoredGroupIds: readonly string[];
    includeIds?: readonly string[];
  }) {
    const probe = U.normalizeTaxonomySearch(text).slice(
      0,
      ROLE_CANDIDATE_TEXT_MAX_LENGTH,
    );

    const [similar, contained, favored, included] = await Promise.all([
      nonSpaceLength(probe) >= C.TAXONOMY_SEARCH_MIN_LENGTH
        ? this.prisma.$queryRaw<{ id: string }[]>`
            SELECT term."id"
            FROM "ProfileTaxonomyTerm" AS term
            WHERE term."kind" = ${P.ProfileTaxonomyKind.ROLE}::"ProfileTaxonomyKind"
              AND term."isActive" = true
              AND term."label" % ${probe}
            ORDER BY similarity(term."label", ${probe}) DESC, term."id"
            LIMIT ${ROLE_CANDIDATES_BY_TEXT}`
        : Promise.resolve([]),
      nonSpaceLength(probe) >= C.TAXONOMY_SEARCH_MIN_LENGTH
        ? this.prisma.profileTaxonomyTerm.findMany({
            where: {
              kind: P.ProfileTaxonomyKind.ROLE,
              isActive: true,
              label: { contains: probe, mode: "insensitive" },
            },
            orderBy: U.TAXONOMY_TERM_ORDER,
            take: ROLE_CANDIDATES_BY_TEXT,
            select: { id: true },
          })
        : Promise.resolve([]),
      Promise.all(
        [...new Set(favoredGroupIds)].map((groupId) =>
          this.prisma.profileTaxonomyTerm.findMany({
            where: {
              groupId,
              kind: P.ProfileTaxonomyKind.ROLE,
              isActive: true,
            },
            orderBy: U.TAXONOMY_TERM_ORDER,
            take: ROLE_CANDIDATES_PER_GROUP,
            select: { id: true },
          }),
        ),
      ),
      Promise.resolve(includeIds.map((id) => ({ id }))),
    ]);

    const ids = [
      ...new Set(
        [...included, ...similar, ...contained, ...favored.flat()].map(
          (row) => row.id,
        ),
      ),
    ];
    if (!ids.length) return [];

    const rows = await this.prisma.profileTaxonomyTerm.findMany({
      where: {
        id: { in: ids },
        kind: P.ProfileTaxonomyKind.ROLE,
        isActive: true,
      },
      orderBy: U.TAXONOMY_TERM_ORDER,
      select: U.TAXONOMY_TERM_SELECT,
    });
    return rows.map(U.toTaxonomyTerm);
  }

  async favoredRoleGroupIds(userId: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId },
      select: {
        currentRoleTerm: { select: { groupId: true } },
        terms: {
          where: { usage: { in: SKILL_USAGES } },
          select: { term: { select: { groupId: true } } },
        },
      },
    });
    if (!profile) return [];

    const skillGroupIds = [
      ...new Set(profile.terms.map((row) => row.term.groupId)),
    ];
    const mapped = skillGroupIds.length
      ? await this.prisma.profileTaxonomyGroupMapping.findMany({
          where: { skillGroupId: { in: skillGroupIds }, isActive: true },
          select: { roleGroupId: true },
        })
      : [];

    const weight = new Map<string, number>();
    for (const row of mapped)
      weight.set(row.roleGroupId, (weight.get(row.roleGroupId) ?? 0) + 1);
    const strongest = [...weight.entries()]
      .sort(
        ([leftId, left], [rightId, right]) =>
          right - left || leftId.localeCompare(rightId),
      )
      .slice(0, FAVORED_ROLE_GROUPS_FROM_SKILLS)
      .map(([roleGroupId]) => roleGroupId);

    return [
      ...new Set([
        ...(profile.currentRoleTerm ? [profile.currentRoleTerm.groupId] : []),
        ...strongest,
      ]),
    ];
  }
}
