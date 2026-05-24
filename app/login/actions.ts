"use server";

import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SupabasePublicConfigError } from "@/app/lib/supabase/env";
import { createSupabaseAdminClient, createSupabaseServerClient, SupabaseServerConfigError } from "@/app/lib/supabase/server";
import {
  activeWorkspaceCookieName,
  adminPermissions,
  clearLocalAuthCookies,
  devUserCookieName,
  devUsers,
  getAppSession,
  hasWorkspaceAccess,
  isDevAuthEnabled,
  legacyDevWorkspaceCookieName,
  resolveSessionByAuthIdentity,
  setActiveWorkspaceCookie,
  workspaceConfig,
  type DevUserKey,
  type WorkspaceRole,
} from "@/app/lib/dev-auth";

type OwnerRegistrationKind = "school_admin" | "solo_teacher";

const ownerRegistrationKinds = new Set<OwnerRegistrationKind>(["school_admin", "solo_teacher"]);
const minRegistrationPasswordLength = 8;

function loginRedirect(params: Record<string, string>): never {
  const searchParams = new URLSearchParams(params);
  redirect(`/login?${searchParams.toString()}`);
}

function requiredString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function readOwnerRegistrationKind(formData: FormData): OwnerRegistrationKind | null {
  const value = requiredString(formData, "registrationKind");

  return ownerRegistrationKinds.has(value as OwnerRegistrationKind) ? (value as OwnerRegistrationKind) : null;
}

function registrationRedirect(params: Record<string, string>): never {
  const searchParams = new URLSearchParams(params);
  redirect(`/login?${searchParams.toString()}#entry-registration`);
}

async function cleanupFailedRegistration(input: {
  authUserId?: string;
  organizationId?: string;
  userId?: string;
}) {
  const adminClient = createSupabaseAdminClient();

  if (input.organizationId && input.userId) {
    await adminClient.from("organization_members").delete().eq("organization_id", input.organizationId).eq("user_id", input.userId);
  }

  if (input.userId) {
    await adminClient.from("users").delete().eq("id", input.userId);
  }

  if (input.organizationId) {
    await adminClient.from("organizations").delete().eq("id", input.organizationId);
  }

  if (input.authUserId) {
    await adminClient.auth.admin.deleteUser(input.authUserId);
  }
}

async function loginAs(userKey: DevUserKey) {
  if (!isDevAuthEnabled()) {
    redirect("/login?error=dev_auth_disabled");
  }

  const seedUser = devUsers[userKey];
  const cookieStore = await cookies();

  cookieStore.set(devUserCookieName, seedUser.email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  cookieStore.set(legacyDevWorkspaceCookieName, seedUser.preferredWorkspace, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  cookieStore.set(activeWorkspaceCookieName, seedUser.preferredWorkspace, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  redirect(workspaceConfig[seedUser.preferredWorkspace].homePath);
}

export async function loginAsAdmin() {
  await loginAs("admin");
}

export async function loginAsTeacher() {
  await loginAs("teacher");
}

export async function loginAsStudent() {
  await loginAs("student");
}

export async function loginAsPrivateTeacher() {
  await loginAs("privateTeacher");
}

export async function registerOwnerAccount(formData: FormData) {
  const registrationKind = readOwnerRegistrationKind(formData);
  const ownerName = requiredString(formData, "ownerName");
  const email = requiredString(formData, "registrationEmail").toLowerCase();
  const password = requiredString(formData, "registrationPassword");
  const organizationName = requiredString(formData, "organizationName");

  if (!registrationKind) {
    registrationRedirect({ error: "registration_kind_invalid" });
  }

  if (!ownerName || !email || !password || !organizationName) {
    registrationRedirect({ error: "registration_missing_fields" });
  }

  if (password.length < minRegistrationPasswordLength) {
    registrationRedirect({ error: "registration_password_short" });
  }

  let adminClient: ReturnType<typeof createSupabaseAdminClient>;
  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;

  try {
    adminClient = createSupabaseAdminClient();
    supabase = await createSupabaseServerClient();
  } catch (error) {
    if (error instanceof SupabasePublicConfigError || error instanceof SupabaseServerConfigError) {
      registrationRedirect({ error: "supabase_not_configured" });
    }

    throw error;
  }

  const existingUserResult = await adminClient.from("users").select("id").eq("email", email).maybeSingle();

  if (existingUserResult.error) {
    registrationRedirect({ error: "registration_failed" });
  }

  if (existingUserResult.data) {
    registrationRedirect({ error: "registration_account_exists" });
  }

  const headersList = await headers();
  const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/login?message=email_confirmed")}`;
  const signUpResult = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        deshar_registration_kind: registrationKind,
        name: ownerName,
      },
      emailRedirectTo,
    },
  });

  if (signUpResult.error) {
    const message = signUpResult.error.message.toLowerCase();
    registrationRedirect({
      error: message.includes("already") || message.includes("registered") ? "registration_account_exists" : "registration_failed",
    });
  }

  const authUserId = signUpResult.data.user?.id;

  if (!authUserId || (Array.isArray(signUpResult.data.user?.identities) && signUpResult.data.user.identities.length === 0)) {
    registrationRedirect({ error: "registration_account_exists" });
  }

  await supabase.auth.signOut();

  let organizationId: string | undefined;
  let userId: string | undefined;

  try {
    const now = new Date().toISOString();
    const organizationType = registrationKind === "solo_teacher" ? "solo_teacher" : "school";
    const memberRoles = registrationKind === "solo_teacher" ? ["solo_teacher", "teacher", "admin"] : ["admin"];
    const permissions = registrationKind === "solo_teacher" ? [...adminPermissions, "journal:write:any"] : [...adminPermissions];

    const organizationResult = await adminClient
      .from("organizations")
      .insert({
        name: organizationName,
        status: "active",
        type: organizationType,
        updated_at: now,
      })
      .select("id")
      .single();

    if (organizationResult.error || !organizationResult.data?.id) {
      throw new Error(organizationResult.error?.message ?? "Organization was not created.");
    }

    organizationId = organizationResult.data.id;

    const userResult = await adminClient
      .from("users")
      .insert({
        auth_status: "invited",
        auth_user_id: authUserId,
        email,
        invited_at: now,
        name: ownerName,
        status: "active",
        updated_at: now,
      })
      .select("id")
      .single();

    if (userResult.error || !userResult.data?.id) {
      throw new Error(userResult.error?.message ?? "User profile was not created.");
    }

    userId = userResult.data.id;

    const memberResult = await adminClient.from("organization_members").insert({
      organization_id: organizationId,
      permissions,
      roles: memberRoles,
      status: "active",
      updated_at: now,
      user_id: userId,
    });

    if (memberResult.error) {
      throw new Error(memberResult.error.message);
    }
  } catch {
    await cleanupFailedRegistration({ authUserId, organizationId, userId }).catch(() => undefined);
    registrationRedirect({ error: "registration_failed" });
  }

  registrationRedirect({ message: "registration_email_sent" });
}

export async function loginWithPassword(formData: FormData) {
  const email = requiredString(formData, "email").toLowerCase();
  const password = requiredString(formData, "password");

  if (!email || !password) {
    loginRedirect({ error: "missing_credentials" });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const result = await supabase.auth.signInWithPassword({ email, password });

    if (result.error || !result.data.user?.email) {
      loginRedirect({ error: "invalid_credentials" });
    }

    const resolved = await resolveSessionByAuthIdentity({
      authUserId: result.data.user.id,
      email: result.data.user.email,
    });
    const session = resolved.session;

    if (!session) {
      await supabase.auth.signOut();
      loginRedirect({ error: resolved.failure ?? "profile_not_found" });
    }

    await setActiveWorkspaceCookie(session.activeWorkspace);
    redirect(workspaceConfig[session.activeWorkspace].homePath);
  } catch (error) {
    if (error instanceof SupabasePublicConfigError) {
      loginRedirect({ error: "supabase_not_configured" });
    }

    throw error;
  }
}

export async function requestPasswordReset(formData: FormData) {
  const email = requiredString(formData, "resetEmail").toLowerCase();

  if (!email) {
    loginRedirect({ error: "missing_reset_email" });
  }

  try {
    const headersList = await headers();
    const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
      loginRedirect({ error: "reset_failed" });
    }

    loginRedirect({ message: "password_reset_sent" });
  } catch (error) {
    if (error instanceof SupabasePublicConfigError) {
      loginRedirect({ error: "supabase_not_configured" });
    }

    throw error;
  }
}

export async function logout() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (error) {
    if (!(error instanceof SupabasePublicConfigError)) {
      throw error;
    }
  }

  await clearLocalAuthCookies();
  redirect("/login");
}

export async function switchWorkspace(workspace: WorkspaceRole) {
  const session = await getAppSession();

  if (!session || !hasWorkspaceAccess(session, workspace)) {
    redirect(`/forbidden?required=${workspace}`);
  }

  await setActiveWorkspaceCookie(workspace);

  redirect(workspaceConfig[workspace].homePath);
}
