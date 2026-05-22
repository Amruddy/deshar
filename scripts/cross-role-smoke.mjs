#!/usr/bin/env node

const baseUrl = normalizeBaseUrl(process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000");

const roles = [
  {
    name: "Администратор",
    cookie: "dev_user_email=admin@example.test; dev_workspace=admin",
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
    required: [
      "/teacher",
      "/teacher/groups",
      "/teacher/students",
      "/teacher/attendance",
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

for (const role of roles) {
  const cache = new Map();

  console.log(`\n${role.name}`);

  for (const path of role.required) {
    const result = await checkPath(role, path);
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
}

if (failures.length > 0) {
  console.error("\nSmoke по ролям не прошел:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`\nSmoke по ролям прошел. Проверено: ${checkedCount}. Пропущено динамических ссылок: ${skippedCount}.`);

async function checkPath(role, path, label = path) {
  const targetUrl = new URL(path, baseUrl);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Cookie: role.cookie,
      },
      redirect: "manual",
    });

    const body = await response.text();
    const redirectTarget = response.headers.get("location");
    const isBlockedRedirect =
      response.status >= 300 &&
      response.status < 400 &&
      (redirectTarget?.startsWith("/login") || redirectTarget?.startsWith("/forbidden"));
    const isUnexpectedStatus = response.status >= 400 || (response.status >= 300 && response.status < 400);

    if (isBlockedRedirect || isUnexpectedStatus) {
      const redirectSuffix = redirectTarget ? ` -> ${redirectTarget}` : "";
      failures.push(`${role.name}: ${path} вернул ${response.status}${redirectSuffix}`);
      console.log(`  [fail] ${label}: ${response.status}${redirectSuffix}`);
      return { body };
    }

    const supabaseDataState = getSupabaseDataFailureState(body);

    if (supabaseDataState) {
      failures.push(`${role.name}: ${path} показал Supabase ${supabaseDataState} state`);
      console.log(`  [fail] ${label}: Supabase ${supabaseDataState} state`);
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
  return value.replaceAll("&amp;", "&").replaceAll("&#x2F;", "/").replaceAll("&#47;", "/");
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
