"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  archiveAdminCourse,
  archiveAdminGroup,
  archiveAdminStudent,
  assignAdminStudentToGroup,
  createAdminCourse,
  createAdminGroup,
  createAdminGroupScheduleRule,
  createAdminStudent,
  createAdminTeacher,
  deleteAdminGroupScheduleRule,
  disableAdminStudentAccess,
  disableAdminTeacherAccess,
  generateAdminGroupLessons,
  inviteAdminStudentAccess,
  inviteAdminTeacherAccess,
  removeAdminStudentFromGroup,
  type LessonGenerationHorizon,
  updateAdminCourse,
  updateAdminGroup,
  updateAdminStudent,
} from "@/app/lib/data/admin-write";
import { requireWorkspace, requireWorkspacePermission, type Permission } from "@/app/lib/dev-auth";

async function requireAdmin(permission?: Permission) {
  return permission ? requireWorkspacePermission("admin", permission) : requireWorkspace("admin");
}

function requiredString(formData: FormData, name: string, label: string) {
  const value = formData.get(name);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label}: обязательное поле.`);
  }

  return value.trim();
}

function optionalString(formData: FormData, name: string) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requiredIntegers(formData: FormData, name: string, label: string) {
  const values = formData.getAll(name);

  if (values.length === 0) {
    throw new Error(`${label}: выберите хотя бы одно значение.`);
  }

  return values.map((raw) => {
    if (typeof raw !== "string") {
      throw new Error(`${label}: неверное значение.`);
    }

    const value = Number.parseInt(raw, 10);

    if (!Number.isInteger(value)) {
      throw new Error(`${label}: неверное число.`);
    }

    return value;
  });
}

function lessonGenerationHorizon(formData: FormData): LessonGenerationHorizon {
  const value = optionalString(formData, "horizon") ?? "one_month";

  if (value === "one_month" || value === "three_months" || value === "schedule_end") {
    return value;
  }

  throw new Error("Срок создания занятий: неверное значение.");
}

function actionErrorCode(error: unknown, fallback: string) {
  return error instanceof Error && error.message.includes("Supabase") ? "supabase_failed" : fallback;
}

function redirectWithParams(path: string, params: Record<string, string>): never {
  const searchParams = new URLSearchParams(params);
  redirect(`${path}?${searchParams.toString()}`);
}

async function runActionOrRedirect<T>(path: string, fallbackError: string, action: () => Promise<T>) {
  try {
    return await action();
  } catch (error) {
    redirectWithParams(path, { actionError: actionErrorCode(error, fallbackError) });
  }
}

async function inviteRedirectTo() {
  const headersList = await headers();
  const origin = headersList.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return `${origin}/auth/callback?next=/auth/reset-password`;
}

export async function createCourse(formData: FormData) {
  const session = await requireAdmin("courses:write");

  await createAdminCourse({
    organizationId: session.organizationId,
    createdBy: session.userId,
    name: requiredString(formData, "name", "Название курса"),
    description: optionalString(formData, "description"),
    format: requiredString(formData, "format", "Формат курса"),
    lessonMarkScale: requiredString(formData, "lessonMarkScale", "Шкала оценок"),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

export async function updateCourse(courseId: string, formData: FormData) {
  const session = await requireAdmin("courses:write");

  await updateAdminCourse({
    organizationId: session.organizationId,
    courseId,
    name: requiredString(formData, "name", "Название курса"),
    description: optionalString(formData, "description"),
    format: requiredString(formData, "format", "Формат курса"),
    lessonMarkScale: requiredString(formData, "lessonMarkScale", "Шкала оценок"),
    status: requiredString(formData, "status", "Статус курса"),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}

export async function archiveCourse(courseId: string) {
  const session = await requireAdmin("courses:write");

  await archiveAdminCourse({
    organizationId: session.organizationId,
    courseId,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}

export async function createTeacher(formData: FormData) {
  const session = await requireAdmin();

  await createAdminTeacher({
    organizationId: session.organizationId,
    name: requiredString(formData, "name", "Имя преподавателя"),
    email: requiredString(formData, "email", "Email преподавателя"),
    phone: optionalString(formData, "phone"),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/teachers");
  redirect("/admin/teachers");
}

export async function inviteTeacherAccess(userId: string) {
  const session = await requireAdmin();

  try {
    await inviteAdminTeacherAccess({
      organizationId: session.organizationId,
      redirectTo: await inviteRedirectTo(),
      userId,
    });
  } catch (error) {
    redirectWithParams("/admin/teachers", { accessError: actionErrorCode(error, "invite_failed") });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/teachers");
  redirectWithParams("/admin/teachers", { accessMessage: "invite_sent" });
}

export async function disableTeacherAccess(userId: string) {
  const session = await requireAdmin();

  try {
    await disableAdminTeacherAccess({
      actorUserId: session.userId,
      organizationId: session.organizationId,
      userId,
    });
  } catch (error) {
    redirectWithParams("/admin/teachers", { accessError: actionErrorCode(error, "disable_failed") });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/teachers");
  redirectWithParams("/admin/teachers", { accessMessage: "access_disabled" });
}

export async function createStudent(formData: FormData) {
  const session = await requireAdmin("students:write");

  await createAdminStudent({
    organizationId: session.organizationId,
    name: requiredString(formData, "name", "Имя ученика"),
    phone: optionalString(formData, "phone"),
    email: optionalString(formData, "email"),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function updateStudent(studentId: string, formData: FormData) {
  const session = await requireAdmin("students:write");

  await updateAdminStudent({
    organizationId: session.organizationId,
    studentId,
    name: requiredString(formData, "name", "Имя ученика"),
    phone: optionalString(formData, "phone"),
    email: optionalString(formData, "email"),
    status: requiredString(formData, "status", "Статус ученика"),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
  redirect(`/admin/students/${studentId}`);
}

export async function archiveStudent(studentId: string) {
  const session = await requireAdmin("students:write");

  await archiveAdminStudent({
    organizationId: session.organizationId,
    studentId,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
  redirect(`/admin/students/${studentId}`);
}

export async function inviteStudentAccess(studentId: string) {
  const session = await requireAdmin("students:write");

  try {
    await inviteAdminStudentAccess({
      organizationId: session.organizationId,
      redirectTo: await inviteRedirectTo(),
      studentId,
    });
  } catch (error) {
    redirectWithParams(`/admin/students/${studentId}`, { accessError: actionErrorCode(error, "invite_failed") });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
  redirectWithParams(`/admin/students/${studentId}`, { accessMessage: "invite_sent" });
}

export async function disableStudentAccess(studentId: string) {
  const session = await requireAdmin("students:write");

  try {
    await disableAdminStudentAccess({
      actorUserId: session.userId,
      organizationId: session.organizationId,
      studentId,
    });
  } catch (error) {
    redirectWithParams(`/admin/students/${studentId}`, { accessError: actionErrorCode(error, "disable_failed") });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
  redirectWithParams(`/admin/students/${studentId}`, { accessMessage: "access_disabled" });
}

export async function createGroup(formData: FormData) {
  const session = await requireAdmin("groups:write");

  await runActionOrRedirect("/admin/groups", "group_create_failed", () =>
    createAdminGroup({
      organizationId: session.organizationId,
      courseId: requiredString(formData, "courseId", "Курс"),
      teacherId: requiredString(formData, "teacherId", "Преподаватель"),
      name: requiredString(formData, "name", "Название группы"),
      status: requiredString(formData, "status", "Статус группы"),
    }),
  );

  revalidatePath("/admin");
  revalidatePath("/admin/groups");
  redirectWithParams("/admin/groups", { actionMessage: "group_created" });
}

export async function updateGroup(groupId: string, formData: FormData) {
  const session = await requireAdmin("groups:write");

  await runActionOrRedirect(`/admin/groups/${groupId}`, "group_update_failed", () =>
    updateAdminGroup({
      organizationId: session.organizationId,
      groupId,
      teacherId: optionalString(formData, "teacherId"),
      name: requiredString(formData, "name", "Название группы"),
      status: requiredString(formData, "status", "Статус группы"),
    }),
  );

  revalidatePath("/admin");
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${groupId}`);
  redirectWithParams(`/admin/groups/${groupId}`, { actionMessage: "group_updated" });
}

export async function archiveGroup(groupId: string) {
  const session = await requireAdmin("groups:write");

  await runActionOrRedirect(`/admin/groups/${groupId}`, "group_archive_failed", () =>
    archiveAdminGroup({
      organizationId: session.organizationId,
      groupId,
    }),
  );

  revalidatePath("/admin");
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${groupId}`);
  revalidatePath("/teacher");
  revalidatePath("/teacher/groups");
  revalidatePath("/student");
  redirectWithParams(`/admin/groups/${groupId}`, { actionMessage: "group_archived" });
}

export async function createGroupScheduleRule(groupId: string, formData: FormData) {
  const session = await requireAdmin("groups:write");

  await runActionOrRedirect(`/admin/groups/${groupId}`, "schedule_create_failed", () =>
    createAdminGroupScheduleRule({
      organizationId: session.organizationId,
      groupId,
      weekdays: requiredIntegers(formData, "weekdays", "Дни недели"),
      startTime: requiredString(formData, "startTime", "Время начала"),
      endTime: requiredString(formData, "endTime", "Время окончания"),
      startsOn: requiredString(formData, "startsOn", "Дата начала"),
      endsOn: optionalString(formData, "endsOn"),
    }),
  );

  revalidatePath("/admin");
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${groupId}`);
  redirectWithParams(`/admin/groups/${groupId}`, { actionMessage: "schedule_created" });
}

export async function deleteScheduleRule(scheduleRuleId: string, groupId: string) {
  const session = await requireAdmin("groups:write");

  await runActionOrRedirect(`/admin/groups/${groupId}`, "schedule_delete_failed", () =>
    deleteAdminGroupScheduleRule({
      organizationId: session.organizationId,
      groupId,
      scheduleRuleId,
    }),
  );

  revalidatePath("/admin");
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${groupId}`);
  redirectWithParams(`/admin/groups/${groupId}`, { actionMessage: "schedule_deleted" });
}

export async function generateLessonsForGroup(groupId: string, formData: FormData) {
  const session = await requireAdmin("groups:write");

  const createdCount = await runActionOrRedirect(`/admin/groups/${groupId}`, "lessons_generate_failed", () =>
    generateAdminGroupLessons({
      organizationId: session.organizationId,
      groupId,
      horizon: lessonGenerationHorizon(formData),
    }),
  );

  revalidatePath("/admin");
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${groupId}`);
  redirectWithParams(`/admin/groups/${groupId}`, {
    actionMessage: createdCount && createdCount > 0 ? "lessons_generated" : "lessons_unchanged",
  });
}

export async function addStudentToGroup(groupId: string, formData: FormData) {
  const session = await requireAdmin("groups:write");
  await runActionOrRedirect(`/admin/groups/${groupId}`, "student_add_failed", async () => {
    const studentId = requiredString(formData, "studentId", "Ученик");
    await assignAdminStudentToGroup({ organizationId: session.organizationId, groupId, studentId });
  });
  revalidatePath("/admin");
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${groupId}`);
  redirectWithParams(`/admin/groups/${groupId}`, { actionMessage: "student_added" });
}

export async function assignStudentToGroup(formData: FormData) {
  const session = await requireAdmin("groups:write");

  await runActionOrRedirect("/admin/groups", "student_assign_failed", async () => {
    const groupId = requiredString(formData, "groupId", "Группа");
    const studentId = requiredString(formData, "studentId", "Ученик");
    await assignAdminStudentToGroup({ organizationId: session.organizationId, groupId, studentId });
  });

  revalidatePath("/admin");
  revalidatePath("/admin/groups");
  redirectWithParams("/admin/groups", { actionMessage: "student_assigned" });
}

export async function assignStudentToGroupFromStudent(studentId: string, formData: FormData) {
  const session = await requireAdmin("groups:write");

  const groupId = requiredString(formData, "groupId", "Группа");

  await assignAdminStudentToGroup({ organizationId: session.organizationId, groupId, studentId });

  revalidatePath("/admin");
  revalidatePath("/admin/groups");
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
  redirect(`/admin/students/${studentId}`);
}

export async function removeStudentFromGroup(groupStudentId: string, groupId: string) {
  const session = await requireAdmin("groups:write");

  await removeAdminStudentFromGroup({
    organizationId: session.organizationId,
    groupId,
    groupStudentId,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${groupId}`);
  redirect(`/admin/groups/${groupId}`);
}

export async function removeStudentFromGroupFromStudent(groupStudentId: string, groupId: string, studentId: string) {
  const session = await requireAdmin("groups:write");

  await removeAdminStudentFromGroup({
    organizationId: session.organizationId,
    groupId,
    groupStudentId,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${groupId}`);
  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
  redirect(`/admin/students/${studentId}`);
}
