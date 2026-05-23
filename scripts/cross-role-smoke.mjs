#!/usr/bin/env node

const baseUrl = normalizeBaseUrl(process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000");

const unauthenticatedRedirects = [
  { path: "/admin", expected: "/login" },
  { path: "/teacher", expected: "/login" },
  { path: "/student", expected: "/login" },
  { path: "/profile", expected: "/login" },
];

const roles = [
  {
    name: "Администратор",
    cookie: "dev_user_email=admin@example.test; dev_workspace=admin",
    forbidden: [
      { path: "/teacher", expected: "/forbidden?required=teacher" },
      { path: "/student", expected: "/forbidden?required=student" },
    ],
    required: [
      "/admin",
      "/admin/courses",
      "/admin/groups",
      "/admin/students",
      "/admin/teachers",
      "/admin/payments",
    ],
    discoveries: [
      { source: "/admin/courses", pattern: /^\/admin\/courses\/[0-9a-f-]{36}$/i, label: "карточка курса" },
      { source: "/admin/groups", pattern: /^\/admin\/groups\/[0-9a-f-]{36}$/i, label: "карточка группы" },
      { source: "/admin/students", pattern: /^\/admin\/students\/[0-9a-f-]{36}$/i, label: "карточка ученика" },
    ],
  },
  {
    name: "Преподаватель",
    cookie: "dev_user_email=teacher@example.test; dev_workspace=teacher",
    forbidden: [
      { path: "/admin", expected: "/forbidden?required=admin" },
      { path: "/student", expected: "/forbidden?required=student" },
    ],
    required: [
      "/teacher",
      "/teacher/groups",
      "/teacher/students",
      {
        includes: 'data-attendance-summary="ready"',
        label: "/teacher/attendance",
        path: "/teacher/attendance",
      },
      "/teacher/homework",
      "/teacher/materials",
      "/teacher/payments",
    ],
    discoveries: [
      { source: "/teacher/groups", pattern: /^\/teacher\/groups\/[0-9a-f-]{36}$/i, label: "карточка группы" },
      { source: "/teacher/groups", pattern: /^\/teacher\/groups\/[0-9a-f-]{36}\/journal$/i, label: "журнал группы" },
      { source: "/teacher/groups", pattern: /^\/teacher\/lessons\/[0-9a-f-]{36}$/i, label: "страница урока" },
      { source: "/teacher/students", pattern: /^\/teacher\/students\/[0-9a-f-]{36}$/i, label: "карточка ученика" },
    ],
  },
  {
    name: "Ученик",
    cookie: "dev_user_email=student@example.test; dev_workspace=student",
    forbidden: [
      { path: "/admin", expected: "/forbidden?required=admin" },
      { path: "/teacher", expected: "/forbidden?required=teacher" },
    ],
    required: [
      "/student",
      "/student/schedule",
      "/student/homework",
      "/student/materials",
      "/student/progress",
      "/student/attendance",
      "/student/payments",
    ],
    discoveries: [],
  },
];

const failures = [];
let checkedCount = 0;
let skippedCount = 0;

console.log(`Cross-role smoke: ${baseUrl}`);

console.log("\nБез входа");
for (const redirectCheck of unauthenticatedRedirects) {
  await expectRedirect(redirectCheck.path, null, redirectCheck.expected, redirectCheck.path);
}

for (const role of roles) {
  const cache = new Map();

  console.log(`\n${role.name}`);

  for (const required of role.required) {
    const path = typeof required === "string" ? required : required.path;
    const label = typeof required === "string" ? path : required.label ?? required.path;
    const result = await checkPath(role, path, label, typeof required === "string" ? null : required.includes ?? null);
    cache.set(path, result.body);
  }

  for (const discovery of role.discoveries) {
    const html = cache.get(discovery.source) ?? (await checkPath(role, discovery.source)).body;
    const path = findFirstLink(html, discovery.pattern);

    if (!path) {
      skippedCount += 1;
      console.log(`  [skip] ${discovery.label}: ссылка не найдена на ${discovery.source}`);
      continue;
    }

    await checkPath(role, path, discovery.label);
  }

  for (const redirectCheck of role.forbidden) {
    await expectRedirect(redirectCheck.path, role.cookie, redirectCheck.expected, `запрет ${redirectCheck.path}`);
  }
}

if (failures.length > 0) {
  console.error("\nSmoke по ролям не прошел:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`\nSmoke по ролям прошел. Проверено: ${checkedCount}. Пропущено динамических ссылок: ${skippedCount}.`);

async function checkPath(role, path, label = path, includes = null) {
  try {
    const { body, location, status } = await requestPath(path, role.cookie);
    const redirectTarget = location ? locationPath(location) : redirectedPathFromBody(body);
    const isBlockedRedirect =
      status >= 300 &&
      status < 400 &&
      (redirectTarget?.startsWith("/login") || redirectTarget?.startsWith("/forbidden"));
    const isUnexpectedStatus = status >= 400 || (status >= 300 && status < 400);

    if (isBlockedRedirect || isUnexpectedStatus) {
      const redirectSuffix = redirectTarget ? ` -> ${redirectTarget}` : "";
      failures.push(`${role.name}: ${path} вернул ${status}${redirectSuffix}`);
      console.log(`  [fail] ${label}: ${status}${redirectSuffix}`);
      return { body };
    }

    const supabaseDataState = getSupabaseDataFailureState(body);

    if (supabaseDataState) {
      failures.push(`${role.name}: ${path} показал Supabase ${supabaseDataState} state`);
      console.log(`  [fail] ${label}: Supabase ${supabaseDataState} state`);
      return { body };
    }

    if (includes && !body.includes(includes)) {
      failures.push(`${role.name}: ${path} не содержит ожидаемый фрагмент ${includes}`);
      console.log(`  [fail] ${label}: нет ожидаемого содержимого`);
      return { body };
    }

    checkedCount += 1;
    console.log(`  [ok] ${label}`);
    return { body };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push(`${role.name}: ${path} недоступен: ${message}`);
    console.log(`  [fail] ${label}: ${message}`);
    return { body: "" };
  }
}

async function expectRedirect(path, cookie, expectedPathPrefix, label) {
  const response = await requestPath(path, cookie);
  const location = response.location ? locationPath(response.location) : redirectedPathFromBody(response.body);

  if (!isRedirectResponse(response.status, location) || !location.startsWith(expectedPathPrefix)) {
    const redirectSuffix = response.location ? ` -> ${locationPath(response.location)}` : "";
    failures.push(`${label}: ожидался redirect на ${expectedPathPrefix}, получено ${response.status}${redirectSuffix}`);
    console.log(`  [fail] ${label}: ${response.status}${redirectSuffix}`);
    return;
  }

  checkedCount += 1;
  console.log(`  [ok] ${label}: redirect ${location}`);
}

async function requestPath(path, cookie) {
  const headers = cookie ? { Cookie: cookie } : {};
  const response = await fetch(new URL(path, baseUrl), {
    headers,
    redirect: "manual",
  });
  const body = await response.text();

  return {
    body,
    location: response.headers.get("location"),
    status: response.status,
  };
}

function isRedirectResponse(status, location) {
  return Boolean(location) && ((status >= 300 && status < 400) || status === 200);
}

function findFirstLink(html, pattern) {
  const links = collectLinks(html);
  return links.find((link) => pattern.test(link)) ?? null;
}

function collectLinks(html) {
  const links = new Set();
  const hrefPattern = /\bhref=(?:"([^"]+)"|'([^']+)')/g;
  let match;

  while ((match = hrefPattern.exec(html)) !== null) {
    const href = decodeHtmlAttribute(match[1] ?? match[2] ?? "");

    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      continue;
    }

    try {
      const parsedUrl = new URL(href, baseUrl);

      if (parsedUrl.origin !== new URL(baseUrl).origin) {
        continue;
      }

      links.add(parsedUrl.pathname);
    } catch {
      continue;
    }
  }

  return [...links];
}

function decodeHtmlAttribute(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x2F;", "/")
    .replaceAll("&#47;", "/");
}

function locationPath(location) {
  try {
    const parsed = new URL(location, baseUrl);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return location;
  }
}

function redirectedPathFromBody(body) {
  const nextRedirectMatch = body.match(/NEXT_REDIRECT;(?:replace|push);([^;"]+);/);

  if (nextRedirectMatch?.[1]) {
    return locationPath(decodeHtmlAttribute(nextRedirectMatch[1]));
  }

  const metaRedirectMatch = body.match(/<meta[^>]+id=["']__next-page-redirect["'][^>]+content=["'][^"']*url=([^"']+)["']/);

  if (metaRedirectMatch?.[1]) {
    return locationPath(decodeHtmlAttribute(metaRedirectMatch[1]));
  }

  return "";
}

function getSupabaseDataFailureState(html) {
  if (html.includes('data-supabase-state="error"')) {
    return "error";
  }

  if (html.includes('data-supabase-state="setup"')) {
    return "setup";
  }

  return null;
}

function normalizeBaseUrl(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
