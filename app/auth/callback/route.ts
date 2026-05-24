import { NextResponse, type NextRequest } from "next/server";
import { SupabasePublicConfigError } from "@/app/lib/supabase/env";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const nextUrl = new URL(next, request.url);
  const redirectUrl = new URL(request.url);

  redirectUrl.pathname = nextUrl.pathname;
  redirectUrl.search = nextUrl.search;

  if (!code) {
    redirectUrl.pathname = "/login";
    redirectUrl.search = "?error=auth_callback_missing_code";
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      redirectUrl.pathname = "/login";
      redirectUrl.search = "?error=auth_callback_failed";
    }
  } catch (error) {
    if (error instanceof SupabasePublicConfigError) {
      redirectUrl.pathname = "/login";
      redirectUrl.search = "?error=supabase_not_configured";
      return NextResponse.redirect(redirectUrl);
    }

    throw error;
  }

  return NextResponse.redirect(redirectUrl);
}
