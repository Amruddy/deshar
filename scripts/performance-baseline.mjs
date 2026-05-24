#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { createServerClient } from "@supabase/ssr";

loadLocalEnv();

const authMode = process.env.PERF_AUTH_MODE ?? "supabase";
const baseUrl = normalizeBaseUrl(process.env.PERF_BASE_URL ?? process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000");
const sampleCount = positiveInteger(process.env.PERF_SAMPLES, 3);
const warmupCount = positiveInteger(process.env.PERF_WARMUPS, 1);
const smokePassword = process.env.DESHAR_AUTH_SMOKE_PASSWORD || "DesharSmoke123!";

const roleAccounts = {
  admin: { email: "admin@example.test", workspace: "admin" },
  student: { email: "student@example.test", workspace: "student" },
  teacher: { email: "teacher@example.test", workspace: "teacher" },
};
const roles = await resolveRoleCookies();

const baselineRoutes = [
  { label: "/login", path: "/login" },
  { label: "/admin", path: "/admin", cookie: roles.admin },
  { label: "/admin/groups", path: "/admin/groups", cookie: roles.admin },
  { label: "/admin/students", path: "/admin/students", cookie: roles.admin },
  { label: "/teacher", path: "/teacher", cookie: roles.teacher },
  { label: "/teacher/groups", path: "/teacher/groups", cookie: roles.teacher },
  {
    cookie: roles.teacher,
    discover: {
      label: "/teacher/groups/[groupId]/journal",
      pattern: /^\/teacher\/groups\/[0-9a-f-]{36}\/journal$/i,
      source: "/teacher/groups",
    },
  },
  { label: "/teacher/attendance", path: "/teacher/attendance", cookie: roles.teacher },
  { label: "/student", path: "/student", cookie: roles.student },
  { label: "/student/attendance", path: "/student/attendance", cookie: roles.student },
];

const failures = [];
const results = [];

console.log(`Performance baseline: ${baseUrl}`);
console.log(`Auth mode: ${authMode}`);
console.log(`Samples: ${sampleCount}, warmups: ${warmupCount}`);

for (const route of baselineRoutes) {
  const resolved = route.discover ? await resolveDiscoveredRoute(route) : route;

  if (!resolved.path) {
    results.push({
      bytes: 0,
      label: route.discover.label,
      maxMs: 0,
      medianMs: 0,
      minMs: 0,
      path: "skip",
      redirect: "",
      samples: [],
      state: "skipped",
      status: "skip",
    });
    console.log(`  [skip] ${route.discover.label}: ссылка не найдена на ${route.discover.source}`);
    continue;
  }

  for (let index = 0; index < warmupCount; index += 1) {
    await requestRoute(resolved.path, resolved.cookie);
  }

  const samples = [];
  let lastResponse = null;

  for (let index = 0; index < sampleCount; index += 1) {
    lastResponse = await requestRoute(resolved.path, resolved.cookie);
    samples.push(lastResponse.durationMs);
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const medianMs = sorted[Math.floor(sorted.length / 2)] ?? 0;
  const state = getSupabaseDataFailureState(lastResponse.body);
  const statusLabel = String(lastResponse.status);
  const redirect = lastResponse.location ? locationPath(lastResponse.location) : redirectedPathFromBody(lastResponse.body);
  const result = {
    bytes: byteLength(lastResponse.body),
    label: resolved.label,
    maxMs: Math.round(Math.max(...samples)),
    medianMs: Math.round(medianMs),
    minMs: Math.round(Math.min(...samples)),
    path: resolved.path,
    redirect,
    samples: samples.map((sample) => Math.round(sample)),
    state: state ?? "ready",
    status: statusLabel,
  };

  results.push(result);

  const redirectLabel = redirect ? ` -> ${redirect}` : "";
  const stateLabel = state ? ` Supabase ${state}` : "";
  console.log(
    `  [${state ? "fail" : "ok"}] ${result.label}: ${statusLabel}${redirectLabel}, median ${result.medianMs} ms, ${result.bytes} bytes${stateLabel}`,
  );

  if (lastResponse.status >= 500) {
    failures.push(`${result.label}: HTTP ${lastResponse.status}`);
  }

  if (state) {
    failures.push(`${result.label}: Supabase ${state} state`);
  }
}

console.log("\nMarkdown:");
console.log("| Route | Status | Redirect | Median ms | Min/Max ms | HTML bytes | State |");
console.log("|---|---:|---|---:|---:|---:|---|");

for (const result of results) {
  console.log(
    `| ${result.label} | ${result.status} | ${result.redirect || "-"} | ${result.medianMs} | ${result.minMs}/${result.maxMs} | ${result.bytes} | ${result.state} |`,
  );
}

console.log("\nJSON:");
console.log(JSON.stringify({ baseUrl, results, sampleCount, warmupCount }, null, 2));

if (failures.length > 0) {
  console.error("\nPerformance baseline failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

process.exit(0);

async function resolveDiscoveredRoute(route) {
  const source = await requestRoute(route.discover.source, route.cookie);
  const path = findFirstLink(source.body, route.discover.pattern);

  return {
    cookie: route.cookie,
    label: route.discover.label,
    path,
  };
}

async function resolveRoleCookies() {
  if (authMode === "dev-cookie") {
    return {
      admin: devCookieHeader(roleAccounts.admin),
      student: devCookieHeader(roleAccounts.student),
      teacher: devCookieHeader(roleAccounts.teacher),
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl?.trim() || !publishableKey?.trim()) {
    fail("Для PERF_AUTH_MODE=supabase нужны NEXT_PUBLIC_SUPABASE_URL и publishable/anon key.");
  }

  return {
    admin: await signInWithCookieSession(supabaseUrl, publishableKey, roleAccounts.admin.email, smokePassword),
    student: await signInWithCookieSession(supabaseUrl, publishableKey, roleAccounts.student.email, smokePassword),
    teacher: await signInWithCookieSession(supabaseUrl, publishableKey, roleAccounts.teacher.email, smokePassword),
  };
}

async function signInWithCookieSession(supabaseUrl, publishableKey, email, password) {
  const jar = new Map();
  const client = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return [...jar.entries()].map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const cookie of cookiesToSet) {
          if (cookie.options?.maxAge === 0 || cookie.value === "") {
            jar.delete(cookie.name);
          } else {
            jar.set(cookie.name, cookie.value);
          }
        }
      },
    },
    global: {
      fetch: baselineFetch,
    },
  });

  const { data, error } = await retrySupabase(() => client.auth.signInWithPassword({ email, password }));

  if (error || !data.user) {
    fail(
      `Не удалось войти через Supabase Auth как ${email}: ${error?.message ?? "пустой ответ"}. ` +
        "Сначала запусти npm.cmd run smoke:auth для подготовки локальных smoke-аккаунтов.",
    );
  }

  const cookieHeader = cookieHeaderFromJar(jar);

  if (!cookieHeader) {
    fail(`Supabase SSR client не записал auth cookies для ${email}.`);
  }

  return cookieHeader;
}

async function requestRoute(path, cookie) {
  const headers = cookie ? { Cookie: cookie } : {};
  const startedAt = performance.now();
  const response = await fetch(new URL(path, baseUrl), {
    headers,
    redirect: "manual",
  });
  const body = await response.text();
  const durationMs = performance.now() - startedAt;

  return {
    body,
    durationMs,
    location: response.headers.get("location"),
    status: response.status,
  };
}

async function baselineFetch(input, init) {
  const timeoutMs = positiveInteger(process.env.PERF_SUPABASE_FETCH_TIMEOUT_MS ?? process.env.SMOKE_SUPABASE_FETCH_TIMEOUT_MS, 15000);
  const controller = new AbortController();
  const callerSignal = init?.signal;
  const abortFromCaller = () => controller.abort();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (callerSignal?.aborted) {
    controller.abort();
  } else {
    callerSignal?.addEventListener("abort", abortFromCaller, { once: true });
  }

  try {
    const headers = new Headers(init?.headers);
    headers.set("connection", "close");

    const response = await fetch(input, { ...init, cache: "no-store", headers, signal: controller.signal });
    const body = await response.arrayBuffer();
    const responseBody = response.status === 204 || response.status === 205 ? null : body;

    return new Response(responseBody, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    });
  } finally {
    clearTimeout(timeoutId);
    callerSignal?.removeEventListener("abort", abortFromCaller);
  }
}

function cookieHeaderFromJar(jar) {
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

function devCookieHeader(account) {
  return `dev_user_email=${account.email}; dev_workspace=${account.workspace}`;
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

function byteLength(value) {
  return Buffer.byteLength(value, "utf8");
}

function decodeHtmlAttribute(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x2F;", "/")
    .replaceAll("&#47;", "/");
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

async function retrySupabase(operation) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = await operation();

      if (!result?.error || !isRetryableSupabaseError(result.error) || attempt === maxAttempts) {
        return result;
      }
    } catch (error) {
      if (!isRetryableSupabaseError(error) || attempt === maxAttempts) {
        throw error;
      }
    }

    await delay(500 * attempt);
  }

  return operation();
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function fail(message) {
  console.error(`\nPerformance baseline failed: ${message}`);
  process.exit(1);
}

function isRetryableSupabaseError(error) {
  const message = [
    error?.message,
    error?.code,
    error?.cause?.message,
    error?.cause?.code,
    error?.cause?.cause?.message,
    error?.cause?.cause?.code,
  ]
    .filter(Boolean)
    .join(" ");

  return /AbortError|aborted|fetch failed|terminated|ECONNRESET|UND_ERR_CONNECT_TIMEOUT|Connect Timeout/i.test(message);
}

function loadLocalEnv() {
  const originalKeys = new Set(Object.keys(process.env));
  const merged = {
    ...readEnvFile(".env"),
    ...readEnvFile(".env.local"),
  };

  for (const [key, value] of Object.entries(merged)) {
    if (!originalKeys.has(key)) {
      process.env[key] = value;
    }
  }
}

function readEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  const parsed = {};
  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function locationPath(location) {
  try {
    const parsed = new URL(location, baseUrl);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return location;
  }
}

function normalizeBaseUrl(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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
