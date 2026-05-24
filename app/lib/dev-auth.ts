import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { hasSupabaseAuthStorageCookie, SupabasePublicConfigError, readSupabasePublicEnv } from "@/app/lib/supabase/env";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
  SupabaseRequestTimeoutError,
  SupabaseServerConfigError,
} from "@/app/lib/supabase/server";

export type WorkspaceRole = "admin" | "teacher" | "student";
export type MemberRole = WorkspaceRole | "solo_teacher" | "director";

export type Permission =
  | "admin:access"
  | "courses:write"
  | "groups:write"
  | "journal:write:any"
  | "materials:write"
  | "payments:write"
  | "students:write";

export const workspaceConfig: Record<
  WorkspaceRole,
  {
    label: string;
    homePath: string;
  }
> = {
  admin: {
    label: "Админ",
    homePath: "/admin",
  },
  teacher: {
    label: "Преподаватель",
    homePath: "/teacher",
  },
  student: {
    label: "Ученик",
    homePath: "/student",
  },
};

export const adminPermissions = [
  "admin:access",
  "courses:write",
  "groups:write",
  "students:write",
  "payments:write",
  "materials:write",
] as const satisfies readonly Permission[];

export const devUsers = {
  admin: {
    userId: "10000000-0000-4000-8000-000000000001",
    label: "Администратор",
    email: "admin@example.test",
    preferredWorkspace: "admin",
    roles: ["admin", "teacher", "student"],
    permissions: adminPermissions,
  },
  teacher: {
    userId: "10000000-0000-4000-8000-000000000002",
    label: "Преподаватель",
    email: "teacher@example.test",
    preferredWorkspace: "teacher",
    roles: ["teacher"],
    permissions: ["journal:write:any", "materials:write"],
  },
  student: {
    userId: "10000000-0000-4000-8000-000000000003",
    label: "Ученик",
    email: "student@example.test",
    preferredWorkspace: "student",
    roles: ["student"],
    permissions: [],
  },
  privateTeacher: {
    userId: "10000000-0000-4000-8000-000000000004",
    label: "Преподаватель-одиночка",
    email: "solo-teacher@example.test",
    preferredWorkspace: "teacher",
    roles: ["teacher", "admin"],
    memberRoles: ["solo_teacher", "teacher", "admin"],
    organizationType: "solo_teacher",
    permissions: [...adminPermissions, "journal:write:any"],
  },
} as const satisfies Record<
  string,
  {
    userId: string;
    label: string;
    email: string;
    memberRoles?: readonly MemberRole[];
    organizationType?: string;
    preferredWorkspace: WorkspaceRole;
    roles: readonly WorkspaceRole[];
    permissions: readonly Permission[];
  }
>;

export type DevUserKey = keyof typeof devUsers;

export type DevSession = {
  userId: string;
  name: string;
  email: string;
  organizationId: string;
  organizationName: string;
  organizationType: string;
  memberRoles: MemberRole[];
  roles: WorkspaceRole[];
  permissions: Permission[];
  activeWorkspace: WorkspaceRole;
};

export type AppSession = DevSession;

type WorkspaceAccessSubject = {
  roles: readonly WorkspaceRole[];
  permissions: readonly Permission[];
};

type AppUserRow = {
  auth_status: string | null;
  auth_user_id: string | null;
  email: string;
  id: string;
  name: string;
  status: string;
};

type AppMemberRow = {
  organization_id: string;
  organizations: AppOrganizationRow | AppOrganizationRow[] | null;
  permissions: unknown;
  roles: unknown;
  status: string;
};

type AppOrganizationRow = {
  name: string;
  status: string;
  type: string | null;
};

export type SupabaseAuthIdentity = {
  authUserId: string;
  email: string;
};

export type SessionResolutionFailure =
  | "membership_not_found"
  | "profile_disabled"
  | "profile_not_found"
  | "signed_out"
  | "supabase_not_configured"
  | "workspace_not_available";

export type SessionResolutionResult =
  | {
      failure: null;
      session: AppSession;
    }
  | {
      failure: SessionResolutionFailure;
      session: null;
    };

export const activeWorkspaceCookieName = "deshar_workspace";
export const devUserCookieName = "dev_user_email";
export const legacyDevWorkspaceCookieName = "dev_workspace";

const workspacePriority: WorkspaceRole[] = ["admin", "teacher", "student"];

function isWorkspaceRole(value: string | undefined): value is WorkspaceRole {
  return value === "admin" || value === "teacher" || value === "student";
}

function isMemberRole(value: string | undefined): value is MemberRole {
  return isWorkspaceRole(value) || value === "solo_teacher" || value === "director";
}

function findDevUserByEmail(email: string) {
  return Object.entries(devUsers).find(([, user]) => user.email === email) ?? null;
}

export function hasWorkspaceAccess(subject: WorkspaceAccessSubject, workspace: WorkspaceRole) {
  if (workspace === "admin") {
    return subject.roles.includes("admin") || subject.permissions.includes("admin:access");
  }

  return subject.roles.includes(workspace);
}

export function hasPermission(subject: { permissions: readonly Permission[] }, permission: Permission) {
  return subject.permissions.includes(permission);
}

export function isSoloTeacherSession(session: Pick<AppSession, "memberRoles" | "organizationType">) {
  return session.organizationType === "solo_teacher" || session.memberRoles.includes("solo_teacher");
}

export function isDevAuthEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.DESHAR_ENABLE_DEV_AUTH === "1";
}

function parseWorkspaceRoles(value: unknown): WorkspaceRole[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is WorkspaceRole => typeof item === "string" && isWorkspaceRole(item));
}

function parseMemberRoles(value: unknown): MemberRole[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is MemberRole => typeof item === "string" && isMemberRole(item));
}

function parsePermissions(value: unknown): Permission[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const knownPermissions: Permission[] = [
    "admin:access",
    "courses:write",
    "groups:write",
    "journal:write:any",
    "materials:write",
    "payments:write",
    "students:write",
  ];

  return value.filter((item): item is Permission => typeof item === "string" && knownPermissions.includes(item as Permission));
}

function getAccessibleWorkspaces(subject: WorkspaceAccessSubject): WorkspaceRole[] {
  return workspacePriority.filter((workspace) => hasWorkspaceAccess(subject, workspace));
}

function chooseWorkspace(subject: WorkspaceAccessSubject, requestedWorkspace?: WorkspaceRole, preferredWorkspace?: WorkspaceRole) {
  if (requestedWorkspace && hasWorkspaceAccess(subject, requestedWorkspace)) {
    return requestedWorkspace;
  }

  if (preferredWorkspace && hasWorkspaceAccess(subject, preferredWorkspace)) {
    return preferredWorkspace;
  }

  return getAccessibleWorkspaces(subject)[0] ?? null;
}

async function readSelectedWorkspaceCookie() {
  const cookieStore = await cookies();
  const value =
    cookieStore.get(activeWorkspaceCookieName)?.value ?? cookieStore.get(legacyDevWorkspaceCookieName)?.value ?? undefined;

  return isWorkspaceRole(value) ? value : undefined;
}

export async function setActiveWorkspaceCookie(workspace: WorkspaceRole) {
  const cookieStore = await cookies();

  cookieStore.set(activeWorkspaceCookieName, workspace, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearLocalAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(activeWorkspaceCookieName);
  cookieStore.delete(devUserCookieName);
  cookieStore.delete(legacyDevWorkspaceCookieName);
}

async function getSupabaseAuthIdentity() {
  try {
    const publicEnv = readSupabasePublicEnv();
    const cookieStore = await cookies();

    if (!hasSupabaseAuthStorageCookie(cookieStore.getAll(), publicEnv.url)) {
      return null;
    }

    const supabase = await createSupabaseServerClient();
    const claimsResult = await supabase.auth.getClaims();

    if (claimsResult.error || !claimsResult.data?.claims?.sub) {
      return null;
    }

    let email = typeof claimsResult.data.claims.email === "string" ? claimsResult.data.claims.email : null;

    if (!email) {
      const userResult = await supabase.auth.getUser();
      email = userResult.data.user?.email ?? null;
    }

    if (!email) {
      return null;
    }

    return {
      authUserId: claimsResult.data.claims.sub,
      email: email.trim().toLowerCase(),
    };
  } catch (error) {
    if (error instanceof SupabasePublicConfigError || error instanceof SupabaseRequestTimeoutError || error instanceof TypeError) {
      return null;
    }

    throw error;
  }
}

function getSingleRow<T>(result: { data: T | null; error: { message: string } | null }, context: string) {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }

  return result.data;
}

function getRows<T>(result: { data: T[] | null; error: { message: string } | null }, context: string) {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }

  return result.data ?? [];
}

function memberOrganization(value: AppMemberRow["organizations"]) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function readySession(session: AppSession): SessionResolutionResult {
  return { failure: null, session };
}

function failedSession(failure: SessionResolutionFailure): SessionResolutionResult {
  return { failure, session: null };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const appUserSelect = "id,name,email,status,auth_user_id,auth_status";

async function updateSignedInUser(client: ReturnType<typeof createSupabaseAdminClient>, user: AppUserRow, authUserId?: string) {
  const shouldLinkAuthUser = Boolean(authUserId && !user.auth_user_id);
  const shouldActivate = user.auth_status !== "active";

  if (!shouldLinkAuthUser && !shouldActivate) {
    return user;
  }

  const now = new Date().toISOString();
  const update: Partial<Pick<AppUserRow, "auth_status" | "auth_user_id">> & {
    last_sign_in_at: string;
    updated_at: string;
  } = {
    auth_status: "active",
    last_sign_in_at: now,
    updated_at: now,
  };

  if (authUserId && !user.auth_user_id) {
    update.auth_user_id = authUserId;
  }

  return getSingleRow(
    await client.from("users").update(update).eq("id", user.id).select(appUserSelect).maybeSingle(),
    "Обновление auth-профиля пользователя",
  ) as AppUserRow | null;
}

async function findOrLinkUserByAuthIdentity(
  client: ReturnType<typeof createSupabaseAdminClient>,
  identity: SupabaseAuthIdentity,
): Promise<AppUserRow | SessionResolutionFailure> {
  const userByAuthId = getSingleRow(
    await client.from("users").select(appUserSelect).eq("auth_user_id", identity.authUserId).maybeSingle(),
    "Профиль пользователя по Supabase Auth",
  ) as AppUserRow | null;

  if (userByAuthId) {
    return userByAuthId;
  }

  const userByEmail = getSingleRow(
    await client.from("users").select(appUserSelect).eq("email", normalizeEmail(identity.email)).maybeSingle(),
    "Профиль пользователя по email",
  ) as AppUserRow | null;

  if (!userByEmail || (userByEmail.auth_user_id && userByEmail.auth_user_id !== identity.authUserId)) {
    return "profile_not_found";
  }

  const linkedUser = getSingleRow(
    await client
      .from("users")
      .update({
        auth_status: "active",
        auth_user_id: identity.authUserId,
        last_sign_in_at: new Date().toISOString(),
      })
      .eq("id", userByEmail.id)
      .is("auth_user_id", null)
      .select(appUserSelect)
      .maybeSingle(),
    "Связь профиля пользователя с Supabase Auth",
  ) as AppUserRow | null;

  if (linkedUser) {
    return linkedUser;
  }

  return (
    (getSingleRow(
      await client.from("users").select(appUserSelect).eq("auth_user_id", identity.authUserId).maybeSingle(),
      "Профиль пользователя после связи Supabase Auth",
    ) as AppUserRow | null) ?? "profile_not_found"
  );
}

async function buildSessionForUser(
  client: ReturnType<typeof createSupabaseAdminClient>,
  user: AppUserRow,
  requestedWorkspace?: WorkspaceRole,
  authUserId?: string,
): Promise<SessionResolutionResult> {
  if (user.status !== "active" || user.auth_status === "disabled") {
    return failedSession("profile_disabled");
  }

  const activeUser = authUserId ? await updateSignedInUser(client, user, authUserId) : user;

  if (!activeUser) {
    return failedSession("profile_not_found");
  }

  try {
    const members = getRows(
      await client
        .from("organization_members")
        .select("organization_id,roles,permissions,status,organizations(name,status,type)")
        .eq("user_id", activeUser.id)
        .eq("status", "active"),
      "Рабочие области пользователя",
    ) as AppMemberRow[];

    if (members.length === 0) {
      return failedSession("membership_not_found");
    }

    for (const member of members) {
      const roles = parseWorkspaceRoles(member.roles);
      const memberRoles = parseMemberRoles(member.roles);
      const permissions = parsePermissions(member.permissions);
      const preferredWorkspace = memberRoles.includes("solo_teacher") ? "teacher" : undefined;
      const activeWorkspace = chooseWorkspace({ permissions, roles }, requestedWorkspace, preferredWorkspace);

      if (!activeWorkspace) {
        continue;
      }

      const organization = memberOrganization(member.organizations);

      if (!organization || organization.status !== "active") {
        continue;
      }

      return {
        failure: null,
        session: {
          activeWorkspace,
          email: activeUser.email,
          name: activeUser.name,
          organizationId: member.organization_id,
          organizationName: organization.name,
          organizationType: organization.type ?? "school",
          memberRoles,
          permissions,
          roles,
          userId: activeUser.id,
        },
      };
    }

    return failedSession("workspace_not_available");
  } catch (error) {
    if (error instanceof SupabaseServerConfigError) {
      return failedSession("supabase_not_configured");
    }

    throw error;
  }
}

export async function resolveSessionByEmail(email: string, requestedWorkspace?: WorkspaceRole): Promise<AppSession | null> {
  try {
    const client = createSupabaseAdminClient();
    const user = getSingleRow(
      await client.from("users").select(appUserSelect).eq("email", normalizeEmail(email)).maybeSingle(),
      "Профиль пользователя",
    ) as AppUserRow | null;

    if (!user) {
      return null;
    }

    return (await buildSessionForUser(client, user, requestedWorkspace)).session;
  } catch (error) {
    if (error instanceof SupabaseServerConfigError) {
      return null;
    }

    throw error;
  }
}

export async function resolveSessionByAuthIdentity(
  identity: SupabaseAuthIdentity,
  requestedWorkspace?: WorkspaceRole,
): Promise<SessionResolutionResult> {
  try {
    const client = createSupabaseAdminClient();
    const userOrFailure = await findOrLinkUserByAuthIdentity(client, identity);

    if (typeof userOrFailure === "string") {
      return failedSession(userOrFailure);
    }

    return buildSessionForUser(client, userOrFailure, requestedWorkspace, identity.authUserId);
  } catch (error) {
    if (error instanceof SupabaseServerConfigError) {
      return failedSession("supabase_not_configured");
    }

    throw error;
  }
}

async function getDevCookieSession(): Promise<DevSession | null> {
  const cookieStore = await cookies();
  const email = cookieStore.get(devUserCookieName)?.value;
  const activeWorkspace = cookieStore.get(activeWorkspaceCookieName)?.value ?? cookieStore.get(legacyDevWorkspaceCookieName)?.value;

  if (!email) {
    return null;
  }

  const entry = findDevUserByEmail(email);

  if (!entry) {
    return null;
  }

  const [, user] = entry;
  const roles = [...user.roles];
  const memberRoles = [...("memberRoles" in user ? user.memberRoles : user.roles)];
  const permissions = [...user.permissions];
  const selectedWorkspace =
    isWorkspaceRole(activeWorkspace) && hasWorkspaceAccess({ permissions, roles }, activeWorkspace)
      ? activeWorkspace
      : user.preferredWorkspace;

  if (!hasWorkspaceAccess({ permissions, roles }, selectedWorkspace)) {
    return null;
  }

  return {
    userId: user.userId,
    name: user.label,
    email: user.email,
    organizationId: "00000000-0000-4000-8000-000000000001",
    organizationName: "Deshar",
    organizationType: "organizationType" in user ? user.organizationType : "school",
    memberRoles,
    roles,
    permissions,
    activeWorkspace: selectedWorkspace,
  };
}

export async function getAppSession(): Promise<AppSession | null> {
  return (await getAppSessionResult()).session;
}

async function resolveAppSessionResult(): Promise<SessionResolutionResult> {
  const supabaseIdentity = await getSupabaseAuthIdentity();

  if (supabaseIdentity) {
    return resolveSessionByAuthIdentity(supabaseIdentity, await readSelectedWorkspaceCookie());
  }

  if (!isDevAuthEnabled()) {
    return failedSession("signed_out");
  }

  const session = await getDevCookieSession();

  return session ? readySession(session) : failedSession("signed_out");
}

export const getAppSessionResult = cache(resolveAppSessionResult);

export async function getDevSession(): Promise<DevSession | null> {
  return getAppSession();
}

export async function requireWorkspace(requiredWorkspace: WorkspaceRole) {
  const result = await getAppSessionResult();
  const session = result.session;

  if (!session) {
    redirect(result.failure === "signed_out" ? "/login" : `/login?error=${result.failure}`);
  }

  if (!hasWorkspaceAccess(session, requiredWorkspace) || session.activeWorkspace !== requiredWorkspace) {
    redirect(`/forbidden?required=${requiredWorkspace}`);
  }

  return session;
}

export async function requireWorkspacePermission(requiredWorkspace: WorkspaceRole, permission: Permission) {
  const session = await requireWorkspace(requiredWorkspace);

  if (!hasPermission(session, permission)) {
    redirect(`/forbidden?required=${permission}`);
  }

  return session;
}
