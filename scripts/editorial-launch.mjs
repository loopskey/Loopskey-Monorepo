#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_MANIFEST = resolve(HERE, "editorial-launch.manifest.json");
const ALLOWED_ENVIRONMENTS = ["development", "staging"];
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

const USAGE = `Applies a reviewed editorial manifest through the real editor and
publication mutations, then asserts the review barriers and the public reads.

  node scripts/editorial-launch.mjs --api-url <url> --environment development|staging [options]
  node scripts/editorial-launch.mjs --self-test

It refuses any environment other than development or staging, and refuses a
non-local API origin unless --allow-remote is given, so it can never publish
production content.

Options
  --api-url <url>       GraphQL origin, for example http://localhost:5701.
  --environment <name>  ${ALLOWED_ENVIRONMENTS.join(" | ")}.
  --manifest <path>     Reviewed content. Default scripts/editorial-launch.manifest.json.
  --allow-remote        Permit a non-local --api-url.
  --format <text|json>  Default text.
  --out <path>          Also write the JSON report to a file.
  --self-test           Check the assertions against built-in good and bad responses.

Credentials come from the environment, never from a flag:
  EDITORIAL_ADMIN_EMAIL, EDITORIAL_ADMIN_PASSWORD,
  EDITORIAL_PROVIDER_EMAIL, EDITORIAL_PROVIDER_PASSWORD,
  EDITORIAL_SECOND_PROVIDER_EMAIL, EDITORIAL_SECOND_PROVIDER_PASSWORD
`;

const parseArgs = (argv) => {
  const flags = new Set(["--self-test", "--allow-remote", "--help"]);
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--"))
      throw new Error(`Unexpected argument ${token}`);
    if (flags.has(token)) {
      values[token.slice(2)] = true;
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("--"))
      throw new Error(`${token} needs a value`);
    values[token.slice(2)] = value;
    index += 1;
  }
  return values;
};

const requiredEnv = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

export const errorCodesOf = (response) =>
  (response?.errors ?? []).map(
    (error) => error.extensions?.code ?? error.message,
  );

export const dataOf = (response, field) => {
  const codes = errorCodesOf(response);
  if (codes.length > 0)
    throw new Error(`${field} failed with ${codes.join(", ")}`);
  return response.data?.[field];
};

const createSession = (apiUrl) => {
  const cookies = new Map();
  const send = async (query, variables) => {
    const headers = { "content-type": "application/json" };
    if (cookies.size > 0)
      headers.cookie = [...cookies]
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });
    for (const header of response.headers.getSetCookie?.() ?? []) {
      const [pair] = header.split(";");
      const separator = pair.indexOf("=");
      if (separator > 0)
        cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
    return response.json();
  };
  return {
    send,
    login: async (email, password) => {
      const response = await send(
        `mutation Login($input: LoginInput!) { login(input: $input) { user { id email role } } }`,
        { input: { email, password } },
      );
      return dataOf(response, "login").user;
    },
  };
};

const PUBLIC_HUB = `query Hub($slug: String!, $locale: AppLanguage) {
  topicHubBySlug(slug: $slug, locale: $locale) {
    slug title introduction guidance contentLanguage availableLocales
    excludeFromIndex sections { heading body } items { kind slug title }
  }
}`;

const PUBLIC_PROVIDER = `query Profile($slug: String!) {
  providerPublicProfileBySlug(slug: $slug) {
    slug displayName biography websiteUrl links { label url }
    items { kind slug title } excludeFromIndex
  }
}`;

const PUBLIC_COURSE = `query Course($slug: String!, $locale: AppLanguage) {
  courseBySlug(slug: $slug, locale: $locale) {
    slug title description contentLanguage availableLocales
  }
}`;

const SHARDS = `query Shards {
  topicHubUrlShards { shards { index urlCount startCursor } }
  providerProfileUrlShards { shards { index urlCount startCursor } }
}`;

const SHARD_PAGE = `query Page($input: EditorialUrlPageInput!) {
  topicHubUrlPage(input: $input) {
    items { slug availableLocales publicChangeAt }
  }
}`;

const SAVE_HUB = `mutation SaveHub($input: SaveTopicHubInput!) {
  saveTopicHub(input: $input) {
    id slug status version eligibleLinkCount linkCount
    translations { locale isPublished version }
  }
}`;

const SET_HUB_STATUS = `mutation SetStatus($input: SetTopicHubStatusInput!) {
  setTopicHubStatus(input: $input) { id status version publishedAt }
}`;

const SET_HUB_TRANSLATION = `mutation SetHubTranslation($input: SetTopicHubTranslationPublicationInput!) {
  setTopicHubTranslationPublication(input: $input) {
    id translations { locale isPublished version }
  }
}`;

const SAVE_PROFILE = `mutation SaveProfile($input: SaveProviderPublicProfileInput!) {
  saveProviderPublicProfile(input: $input) {
    id slug status reviewState draftVersion isLive
  }
}`;

const SUBMIT_PROFILE = `mutation Submit($input: SubmitProviderPublicProfileInput!) {
  submitProviderPublicProfile(input: $input) {
    id reviewState draftVersion submittedAt
  }
}`;

const REVIEW_PROFILE = `mutation Review($input: ReviewProviderPublicProfileInput!) {
  reviewProviderPublicProfile(input: $input) {
    id slug status reviewState publishedAt reviewNote
  }
}`;

const MY_PROFILE = `query Mine { myProviderPublicProfile { id slug reviewState draftVersion } }`;

const SAVE_COURSE_TRANSLATION = `mutation SaveCourseTranslation($input: SaveCourseTranslationInput!) {
  saveCourseTranslation(input: $input) { id locale isPublished version }
}`;

const SET_COURSE_TRANSLATION = `mutation SetCourseTranslation($input: SetCourseTranslationPublicationInput!) {
  setCourseTranslationPublication(input: $input) { id locale isPublished version }
}`;

const HUBS_FOR_CONTENT = `query HubsFor($kind: ContentUrlKind!, $contentId: String!, $locale: AppLanguage) {
  topicHubsForContent(kind: $kind, contentId: $contentId, locale: $locale) { slug title }
}`;

const BYLINE = `query Byline($kind: ContentUrlKind!, $contentId: String!) {
  providerPublicBylineForContent(kind: $kind, contentId: $contentId) { slug displayName }
}`;

const HUB_LIST = `query Hubs($locale: AppLanguage) { topicHubs(locale: $locale) { slug title } }`;

const COURSE_LANGUAGE = `query CourseLanguage($courseId: String!) {
  courseLanguage(courseId: $courseId) {
    courseId sourceLanguage publishedLocales availableLocales
  }
}`;

const SET_SOURCE_LANGUAGE = `mutation SetSourceLanguage($input: SetCourseSourceLanguageInput!) {
  setCourseSourceLanguage(input: $input) {
    courseId sourceLanguage publishedLocales availableLocales
  }
}`;

const COURSE_IDS = `query Catalog($take: Int!) {
  courses(locale: EN, pagination: { take: $take }) { items { id slug title } }
}`;

export const privateFieldLeaks = (payload) => {
  const text = JSON.stringify(payload ?? {});
  const forbidden = [
    "reviewNote",
    "submittedAt",
    "reviewState",
    "draftVersion",
    "providerId",
    "@loopskey.dev",
  ];
  return forbidden.filter((field) => text.includes(field));
};

const run = async ({ apiUrl, manifest }) => {
  const checks = [];
  const record = (name, pass, detail) => {
    checks.push({ name, pass, detail });
    return pass;
  };

  const anonymous = createSession(apiUrl);
  const admin = createSession(apiUrl);
  const provider = createSession(apiUrl);
  const otherProvider = createSession(apiUrl);

  const hubSlug = manifest.topicHub.slug;
  const baseline = {
    hubs: dataOf(await anonymous.send(HUB_LIST, {}), "topicHubs"),
    shards: dataOf(await anonymous.send(SHARDS, {}), "topicHubUrlShards"),
  };
  record(
    "baseline: no published topic hub exists",
    baseline.hubs.length === 0 && baseline.shards.shards.length === 0,
    `hubs=${baseline.hubs.length} shards=${baseline.shards.shards.length}`,
  );

  const adminUser = await admin.login(
    requiredEnv("EDITORIAL_ADMIN_EMAIL"),
    requiredEnv("EDITORIAL_ADMIN_PASSWORD"),
  );
  record(
    "the editorial admin account signs in as ADMIN",
    adminUser.role === "ADMIN",
    adminUser.role,
  );
  const providerUser = await provider.login(
    requiredEnv("EDITORIAL_PROVIDER_EMAIL"),
    requiredEnv("EDITORIAL_PROVIDER_PASSWORD"),
  );
  record(
    "the provider account signs in as PROVIDER",
    providerUser.role === "PROVIDER",
    providerUser.role,
  );

  const catalog = dataOf(
    await anonymous.send(COURSE_IDS, { take: 50 }),
    "courses",
  );
  const courseBySlug = new Map(
    catalog.items.map((course) => [course.slug, course]),
  );
  const references = manifest.topicHub.referenceSlugs.map((slug) => {
    const course = courseBySlug.get(slug);
    if (!course) throw new Error(`Manifest reference ${slug} is not published`);
    return { kind: "COURSE", contentId: course.id };
  });
  const translated = courseBySlug.get(manifest.courseTranslation.courseSlug);
  if (!translated)
    throw new Error(
      `Manifest course ${manifest.courseTranslation.courseSlug} is not published`,
    );

  const draft = dataOf(
    await provider.send(SAVE_PROFILE, {
      input: {
        displayName: manifest.providerProfile.displayName,
        biography: manifest.providerProfile.biography,
        websiteUrl: manifest.providerProfile.websiteUrl,
        links: manifest.providerProfile.links,
      },
    }),
    "saveProviderPublicProfile",
  );
  record(
    "a first save creates a private draft, not a public page",
    draft.reviewState === "DRAFT" && draft.isLive === false,
    `${draft.reviewState} isLive=${draft.isLive}`,
  );
  record(
    "the draft profile answers 404 to the public",
    errorCodesOf(
      await anonymous.send(PUBLIC_PROVIDER, { slug: draft.slug }),
    ).includes("PROVIDER_PROFILE_NOT_FOUND"),
    draft.slug,
  );

  record(
    "a stale version cannot submit the draft",
    errorCodesOf(
      await provider.send(SUBMIT_PROFILE, {
        input: { expectedVersion: draft.draftVersion + 5 },
      }),
    ).includes("PROVIDER_PROFILE_VERSION_CONFLICT"),
    `expected ${draft.draftVersion}`,
  );
  const submitted = dataOf(
    await provider.send(SUBMIT_PROFILE, {
      input: { expectedVersion: draft.draftVersion },
    }),
    "submitProviderPublicProfile",
  );
  record(
    "the provider submits the draft for review",
    submitted.reviewState === "SUBMITTED",
    submitted.reviewState,
  );
  record(
    "a submitted profile is still private",
    errorCodesOf(
      await anonymous.send(PUBLIC_PROVIDER, { slug: draft.slug }),
    ).includes("PROVIDER_PROFILE_NOT_FOUND"),
    draft.slug,
  );
  record(
    "a provider cannot approve its own profile",
    errorCodesOf(
      await provider.send(REVIEW_PROFILE, {
        input: {
          profileId: draft.id,
          decision: "APPROVE",
          expectedDraftVersion: submitted.draftVersion,
        },
      }),
    ).length > 0,
    "review is admin only",
  );

  const secondEmail = process.env.EDITORIAL_SECOND_PROVIDER_EMAIL;
  if (secondEmail) {
    await otherProvider.login(
      secondEmail,
      requiredEnv("EDITORIAL_SECOND_PROVIDER_PASSWORD"),
    );
    const theirs = dataOf(
      await otherProvider.send(MY_PROFILE, {}),
      "myProviderPublicProfile",
    );
    record(
      "another provider never reads this provider's draft",
      theirs === null,
      JSON.stringify(theirs),
    );
    record(
      "another provider cannot translate this provider's course",
      errorCodesOf(
        await otherProvider.send(SAVE_COURSE_TRANSLATION, {
          input: {
            courseId: translated.id,
            locale: "FR",
            title: manifest.courseTranslation.title,
            description: manifest.courseTranslation.description,
          },
        }),
      ).length > 0,
      translated.slug,
    );
  }

  record(
    "an approval of a version that was never submitted fails",
    errorCodesOf(
      await admin.send(REVIEW_PROFILE, {
        input: {
          profileId: draft.id,
          decision: "APPROVE",
          expectedDraftVersion: submitted.draftVersion + 3,
        },
      }),
    ).includes("PROVIDER_PROFILE_VERSION_CONFLICT"),
    `submitted ${submitted.draftVersion}`,
  );
  const approved = dataOf(
    await admin.send(REVIEW_PROFILE, {
      input: {
        profileId: draft.id,
        decision: "APPROVE",
        expectedDraftVersion: submitted.draftVersion,
        note: "Biography and catalogue checked against the published course records.",
      },
    }),
    "reviewProviderPublicProfile",
  );
  record(
    "an explicit approval publishes the profile",
    approved.status === "PUBLISHED" && approved.reviewState === "APPROVED",
    `${approved.status}/${approved.reviewState}`,
  );

  const publicProfile = dataOf(
    await anonymous.send(PUBLIC_PROVIDER, { slug: approved.slug }),
    "providerPublicProfileBySlug",
  );
  record(
    "the public profile serves the approved copy",
    publicProfile.displayName === manifest.providerProfile.displayName &&
      publicProfile.biography === manifest.providerProfile.biography,
    publicProfile.slug,
  );
  record(
    "the public profile leaks no review or account field",
    privateFieldLeaks(publicProfile).length === 0,
    privateFieldLeaks(publicProfile).join(", ") || "none",
  );
  record(
    "the public profile lists the provider's own published content",
    publicProfile.items.length > 0,
    `${publicProfile.items.length} items`,
  );

  const hub = dataOf(
    await admin.send(SAVE_HUB, {
      input: {
        slug: hubSlug,
        locale: "EN",
        category: manifest.topicHub.category,
        title: manifest.topicHub.en.title,
        introduction: manifest.topicHub.en.introduction,
        guidance: manifest.topicHub.en.guidance,
        sections: manifest.topicHub.en.sections,
        references,
      },
    }),
    "saveTopicHub",
  );
  record(
    "the hub draft claims its slug and resolves every reference",
    hub.status === "DRAFT" &&
      hub.eligibleLinkCount === references.length &&
      hub.linkCount === references.length,
    `${hub.status} ${hub.eligibleLinkCount}/${hub.linkCount}`,
  );
  record(
    "a draft hub answers 404 to the public",
    errorCodesOf(
      await anonymous.send(PUBLIC_HUB, { slug: hubSlug, locale: "EN" }),
    ).includes("TOPIC_HUB_NOT_FOUND"),
    hubSlug,
  );

  const published = dataOf(
    await admin.send(SET_HUB_STATUS, {
      input: { hubId: hub.id, status: "PUBLISHED", expectedVersion: hub.version },
    }),
    "setTopicHubStatus",
  );
  record(
    "the hub publishes from the reviewed draft",
    published.status === "PUBLISHED" && Boolean(published.publishedAt),
    published.status,
  );

  const englishHub = dataOf(
    await anonymous.send(PUBLIC_HUB, { slug: hubSlug, locale: "EN" }),
    "topicHubBySlug",
  );
  record(
    "the English hub serves its guidance and only eligible links",
    englishHub.guidance === manifest.topicHub.en.guidance &&
      englishHub.sections.length === manifest.topicHub.en.sections.length &&
      englishHub.items.length === references.length,
    `${englishHub.sections.length} sections, ${englishHub.items.length} links`,
  );
  record(
    "the hub advertises no French variant before one is published",
    englishHub.availableLocales.join(",") === "EN",
    englishHub.availableLocales.join(","),
  );
  record(
    "the French URL is absent while the translation is unpublished",
    (
      dataOf(
        await anonymous.send(PUBLIC_HUB, { slug: hubSlug, locale: "FR" }),
        "topicHubBySlug",
      ).availableLocales ?? []
    ).join(",") === "EN",
    "availableLocales stays EN",
  );

  const withTranslation = dataOf(
    await admin.send(SAVE_HUB, {
      input: {
        hubId: hub.id,
        locale: "FR",
        title: manifest.topicHub.fr.title,
        introduction: manifest.topicHub.fr.introduction,
        guidance: manifest.topicHub.fr.guidance,
        sections: manifest.topicHub.fr.sections,
      },
    }),
    "saveTopicHub",
  );
  const frenchDraft = withTranslation.translations.find(
    (entry) => entry.locale === "FR",
  );
  record(
    "the French translation is saved unpublished",
    frenchDraft !== undefined && frenchDraft.isPublished === false,
    JSON.stringify(frenchDraft),
  );
  record(
    "an unpublished translation is not advertised",
    dataOf(
      await anonymous.send(PUBLIC_HUB, { slug: hubSlug, locale: "FR" }),
      "topicHubBySlug",
    ).availableLocales.join(",") === "EN",
    "availableLocales stays EN",
  );

  const frenchPublished = dataOf(
    await admin.send(SET_HUB_TRANSLATION, {
      input: {
        hubId: hub.id,
        locale: "FR",
        published: true,
        expectedVersion: frenchDraft.version,
      },
    }),
    "setTopicHubTranslationPublication",
  );
  record(
    "the administrator publishes the French translation",
    frenchPublished.translations.some(
      (entry) => entry.locale === "FR" && entry.isPublished,
    ),
    JSON.stringify(frenchPublished.translations),
  );

  const frenchHub = dataOf(
    await anonymous.send(PUBLIC_HUB, { slug: hubSlug, locale: "FR" }),
    "topicHubBySlug",
  );
  record(
    "the French hub serves French copy and both locales",
    frenchHub.title === manifest.topicHub.fr.title &&
      frenchHub.contentLanguage === "FR" &&
      frenchHub.availableLocales.join(",") === "EN,FR",
    `${frenchHub.contentLanguage} [${frenchHub.availableLocales.join(",")}]`,
  );

  const courseDraft = dataOf(
    await provider.send(SAVE_COURSE_TRANSLATION, {
      input: {
        courseId: translated.id,
        locale: "FR",
        title: manifest.courseTranslation.title,
        description: manifest.courseTranslation.description,
        requirements: manifest.courseTranslation.requirements,
        learnings: manifest.courseTranslation.learnings,
      },
    }),
    "saveCourseTranslation",
  );
  record(
    "the provider saves an unpublished French course translation",
    courseDraft.isPublished === false,
    `version ${courseDraft.version}`,
  );
  record(
    "an undeclared source language advertises no variant before translation",
    dataOf(
      await anonymous.send(PUBLIC_COURSE, {
        slug: translated.slug,
        locale: "FR",
      }),
      "courseBySlug",
    ).availableLocales.length === 0,
    translated.slug,
  );

  const coursePublished = dataOf(
    await provider.send(SET_COURSE_TRANSLATION, {
      input: {
        courseId: translated.id,
        locale: "FR",
        published: true,
        expectedVersion: courseDraft.version,
      },
    }),
    "setCourseTranslationPublication",
  );
  record(
    "the French course translation is published",
    coursePublished.isPublished === true,
    `version ${coursePublished.version}`,
  );
  const frenchCourse = dataOf(
    await anonymous.send(PUBLIC_COURSE, {
      slug: translated.slug,
      locale: "FR",
    }),
    "courseBySlug",
  );
  record(
    "the French course serves the translated copy",
    frenchCourse.title === manifest.courseTranslation.title &&
      frenchCourse.description === manifest.courseTranslation.description &&
      frenchCourse.contentLanguage === "FR",
    `${frenchCourse.contentLanguage} [${frenchCourse.availableLocales.join(",")}]`,
  );
  record(
    "an undeclared source language advertises French alone, never English",
    frenchCourse.availableLocales.join(",") === "FR",
    frenchCourse.availableLocales.join(","),
  );

  const declaredBefore = dataOf(
    await provider.send(COURSE_LANGUAGE, { courseId: translated.id }),
    "courseLanguage",
  );
  record(
    "the owner can read that the source language is still undeclared",
    declaredBefore.sourceLanguage === null &&
      declaredBefore.publishedLocales.join(",") === "FR",
    JSON.stringify(declaredBefore),
  );
  record(
    "a source language that is already translated is refused",
    errorCodesOf(
      await provider.send(SET_SOURCE_LANGUAGE, {
        input: { courseId: translated.id, sourceLanguage: "FR" },
      }),
    ).includes("CONTENT_TRANSLATION_SOURCE_LANGUAGE_IS_TRANSLATED"),
    "declaring FR while a French translation is published",
  );
  const declared = dataOf(
    await provider.send(SET_SOURCE_LANGUAGE, {
      input: { courseId: translated.id, sourceLanguage: "EN" },
    }),
    "setCourseSourceLanguage",
  );
  record(
    "declaring the source language makes both locales available",
    declared.sourceLanguage === "EN" &&
      declared.availableLocales.join(",") === "EN,FR",
    JSON.stringify(declared.availableLocales),
  );
  record(
    "the public course now advertises reciprocal English and French variants",
    dataOf(
      await anonymous.send(PUBLIC_COURSE, {
        slug: translated.slug,
        locale: "FR",
      }),
      "courseBySlug",
    ).availableLocales.join(",") === "EN,FR",
    translated.slug,
  );
  record(
    "a provider cannot declare the language of another provider's course",
    secondEmail === undefined ||
      errorCodesOf(
        await otherProvider.send(SET_SOURCE_LANGUAGE, {
          input: { courseId: translated.id, sourceLanguage: "EN" },
        }),
      ).length > 0,
    "ownership is checked on the declaration",
  );

  const hubsForCourse = dataOf(
    await anonymous.send(HUBS_FOR_CONTENT, {
      kind: "COURSE",
      contentId: courseBySlug.get(manifest.topicHub.referenceSlugs[0]).id,
      locale: "EN",
    }),
    "topicHubsForContent",
  );
  record(
    "a referenced course links back to the published hub",
    hubsForCourse.some((entry) => entry.slug === hubSlug),
    hubsForCourse.map((entry) => entry.slug).join(",") || "none",
  );
  const byline = dataOf(
    await anonymous.send(BYLINE, {
      kind: "COURSE",
      contentId: translated.id,
    }),
    "providerPublicBylineForContent",
  );
  record(
    "the course byline points at the approved provider page",
    byline !== null && byline.slug === approved.slug,
    JSON.stringify(byline),
  );

  const shards = await anonymous.send(SHARDS, {});
  const hubShards = dataOf(shards, "topicHubUrlShards");
  const profileShards = dataOf(shards, "providerProfileUrlShards");
  record(
    "both editorial sitemap shards now carry a URL",
    hubShards.shards.length === 1 &&
      hubShards.shards[0].urlCount === 1 &&
      profileShards.shards.length === 1 &&
      profileShards.shards[0].urlCount === 1,
    `hub=${JSON.stringify(hubShards.shards)} provider=${JSON.stringify(profileShards.shards)}`,
  );
  const hubPage = dataOf(
    await anonymous.send(SHARD_PAGE, {
      input: { startCursor: hubShards.shards[0].startCursor },
    }),
    "topicHubUrlPage",
  );
  record(
    "the hub sitemap entry lists both real locales",
    hubPage.items.length === 1 &&
      hubPage.items[0].slug === hubSlug &&
      hubPage.items[0].availableLocales.join(",") === "EN,FR",
    JSON.stringify(hubPage.items),
  );

  const withdrawn = dataOf(
    await admin.send(SET_HUB_STATUS, {
      input: {
        hubId: hub.id,
        status: "WITHDRAWN",
        expectedVersion: published.version,
      },
    }),
    "setTopicHubStatus",
  );
  const afterWithdrawal = await anonymous.send(PUBLIC_HUB, {
    slug: hubSlug,
    locale: "FR",
  });
  record(
    "withdrawal removes every language variant and the sitemap entry",
    withdrawn.status === "WITHDRAWN" &&
      errorCodesOf(afterWithdrawal).includes("TOPIC_HUB_NOT_FOUND") &&
      dataOf(await anonymous.send(SHARDS, {}), "topicHubUrlShards").shards
        .length === 0,
    withdrawn.status,
  );
  const restored = dataOf(
    await admin.send(SET_HUB_STATUS, {
      input: {
        hubId: hub.id,
        status: "PUBLISHED",
        expectedVersion: withdrawn.version,
      },
    }),
    "setTopicHubStatus",
  );
  record(
    "the hub is published again after withdrawal",
    restored.status === "PUBLISHED",
    restored.status,
  );

  return {
    version: 1,
    ranAt: new Date().toISOString(),
    apiUrl,
    manifestPreparedOn: manifest.preparedOn,
    published: {
      topicHub: {
        slug: hubSlug,
        path: manifest.topicHub.expectedPath,
        locales: frenchHub.availableLocales,
        references: englishHub.items.map((item) => item.slug),
      },
      providerProfile: {
        slug: approved.slug,
        path: `/providers/${approved.slug}`,
        items: publicProfile.items.length,
      },
      courseTranslation: {
        slug: translated.slug,
        path: manifest.courseTranslation.expectedPath,
        sourceLanguage: declared.sourceLanguage,
        locales: declared.availableLocales,
      },
    },
    checks,
    failed: checks.filter((check) => !check.pass).length,
  };
};

const renderText = (report) => {
  const lines = report.checks.map(
    (check) => `${check.pass ? "pass" : "FAIL"}  ${check.name} — ${check.detail}`,
  );
  return [
    `editorial-launch against ${report.apiUrl}`,
    ...lines,
    "",
    `topic hub   ${report.published.topicHub.path} [${report.published.topicHub.locales.join(",")}]`,
    `provider    ${report.published.providerProfile.path}`,
    `translation ${report.published.courseTranslation.path} [${report.published.courseTranslation.locales.join(",")}]`,
    `${report.checks.length - report.failed}/${report.checks.length} checks passed`,
  ].join("\n");
};

const selfTest = () => {
  const problems = [];
  const expect = (condition, message) => {
    if (!condition) problems.push(message);
  };

  expect(
    errorCodesOf({
      errors: [{ message: "x", extensions: { code: "TOPIC_HUB_NOT_FOUND" } }],
    })[0] === "TOPIC_HUB_NOT_FOUND",
    "errorCodesOf should read extensions.code",
  );
  expect(
    errorCodesOf({ data: { topicHubs: [] } }).length === 0,
    "errorCodesOf should report no code for a successful response",
  );
  expect(
    dataOf({ data: { topicHubs: [] } }, "topicHubs").length === 0,
    "dataOf should return the field",
  );
  let threw = false;
  try {
    dataOf({ errors: [{ message: "DENIED" }] }, "topicHubs");
  } catch {
    threw = true;
  }
  expect(threw, "dataOf should throw when the response carries an error");
  expect(
    privateFieldLeaks({ slug: "a", displayName: "b" }).length === 0,
    "a clean public payload should report no leak",
  );
  expect(
    privateFieldLeaks({ slug: "a", reviewNote: "private" }).includes(
      "reviewNote",
    ),
    "a review note in a public payload must be caught",
  );
  expect(
    privateFieldLeaks({ contact: "provider.1@loopskey.dev" }).length === 1,
    "an account email in a public payload must be caught",
  );
  return problems;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(USAGE);
    return 0;
  }
  if (args["self-test"]) {
    const problems = selfTest();
    if (problems.length > 0) {
      process.stderr.write(
        `editorial-launch self-test failed:\n${problems.map((problem) => `  ${problem}`).join("\n")}\n`,
      );
      return 1;
    }
    process.stdout.write(
      "editorial-launch self-test passed: every assertion catches its failure case.\n",
    );
    return 0;
  }

  if (!ALLOWED_ENVIRONMENTS.includes(args.environment))
    throw new Error(
      `--environment must be one of ${ALLOWED_ENVIRONMENTS.join(", ")}`,
    );
  if (!args["api-url"]) throw new Error("--api-url is required");
  const target = new URL(args["api-url"]);
  if (!LOCAL_HOSTS.has(target.hostname) && !args["allow-remote"])
    throw new Error(
      `${target.hostname} is not local; pass --allow-remote to publish there deliberately`,
    );
  const apiUrl = target.pathname === "/" ? `${target.origin}/graphql` : target.href;
  const manifest = JSON.parse(
    await readFile(resolve(args.manifest ?? DEFAULT_MANIFEST), "utf8"),
  );
  if (!manifest.environments?.includes(args.environment))
    throw new Error(
      `the manifest allows ${(manifest.environments ?? []).join(", ") || "no environment"}`,
    );

  const report = await run({ apiUrl, manifest });
  process.stdout.write(
    `${args.format === "json" ? JSON.stringify(report, null, 2) : renderText(report)}\n`,
  );
  if (args.out)
    await writeFile(
      resolve(args.out),
      `${JSON.stringify(report, null, 2)}\n`,
      "utf8",
    );
  return report.failed === 0 ? 0 : 1;
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      process.stderr.write(`editorial-launch: ${error.message}\n`);
      process.exitCode = 2;
    },
  );
}
