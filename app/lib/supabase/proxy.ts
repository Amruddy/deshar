import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseAuthStorageCookie, readSupabasePublicEnv, SupabasePublicConfigError } from "@/app/lib/supabase/env";

const defaultProxyFetchTimeoutMs = 5_000;

function readProxyFetchTimeoutMs() {
  const value = Number.parseInt(process.env.SUPABASE_FETCH_TIMEOUT_MS ?? "", 10);

  return Number.isFinite(value) && value > 0 ? value : defaultProxyFetchTimeoutMs;
}

async function fetchWithTimeout(input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) {
  const timeoutMs = readProxyFetchTimeoutMs();
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

    return await fetch(input, { ...init, cache: "no-store", headers, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
    callerSignal?.removeEventListener("abort", abortFromCaller);
  }
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const { publishableKey, url } = readSupabasePublicEnv();

    if (!hasSupabaseAuthStorageCookie(request.cookies.getAll(), url)) {
      return response;
    }

    const supabase = createServerClient(url, publishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, options, value }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
      global: {
        fetch: fetchWithTimeout,
      },
    });

    await supabase.auth.getClaims();
  } catch (error) {
    // Auth refresh in proxy is best effort. Protected pages still verify claims before rendering.
    if (error instanceof SupabasePublicConfigError) {
      return response;
    }
  }

  return response;
}
