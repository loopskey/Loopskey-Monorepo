import { ContentInteractionService } from "@contentAction/services/content-interaction.service";
import { ProviderMessageCode } from "@provider/enums/message-code.enum";
import { PodcastMessageCode } from "@podcast/enums/message-code.enum";
import { YouTubeMessageCode } from "@youtube/enums/message-code.enum";
import { CourseMessageCode } from "@course/enums/message-code.enum";
import { EventMessageCode } from "@events/enums/message-code.enum";
import { CourseService } from "@course/services/course.service";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Regression guard for the Jest/tsconfig alias split.
 *
 * The hand-written `moduleNameMapper` mapped 10 of 26 aliases, leaving 130
 * source files across 10 of 17 modules unreachable from any spec — a failure
 * that surfaced as a misleading "Cannot find module". These imports fail at
 * suite load if the derived mapping regresses.
 */
describe("path alias resolution", () => {
  it("resolves aliases that the hand-written mapper omitted", () => {
    expect(CourseService).toBeDefined();
    expect(ContentInteractionService).toBeDefined();
  });

  it("resolves message codes from every content module", () => {
    expect(CourseMessageCode.COURSE_CREATED).toBe("COURSE_CREATED");
    expect(EventMessageCode.EVENT_CREATED).toBe("EVENT_CREATED");
    expect(PodcastMessageCode.PODCAST_CREATED).toBe("PODCAST_CREATED");
    expect(YouTubeMessageCode.YOUTUBE_VIDEO_CREATED).toBe(
      "YOUTUBE_VIDEO_CREATED",
    );
    expect(ProviderMessageCode.EVENT_NOT_FOUND).toBe("EVENT_NOT_FOUND");
  });

  it("still resolves @prisma/client to the real package, not the alias", () => {
    expect(PrismaClient).toBeDefined();
    expect(typeof PrismaClient).toBe("function");
  });

  /**
   * `tsconfig.build.json` restates the whole alias map instead of inheriting
   * it, so an alias added to `tsconfig.json` type-checks and tests cleanly
   * while `nest build` fails with "Cannot find module". Comparing the two maps
   * turns that into a failing test next to the mapping it protects.
   */
  it("mirrors every tsconfig alias in the build config", () => {
    const read = (file: string) =>
      JSON.parse(readFileSync(resolve(__dirname, "../..", file), "utf8")) as {
        compilerOptions: { paths: Record<string, string[]> };
      };

    const base = read("tsconfig.json").compilerOptions.paths;
    const build = read("tsconfig.build.json").compilerOptions.paths;

    const missing = Object.keys(base).filter((alias) => !(alias in build));
    expect(missing).toEqual([]);

    const mismatched = Object.keys(base).filter(
      (alias) => build[alias].join("|") !== base[alias].join("|"),
    );
    expect(mismatched).toEqual([]);
  });
});
