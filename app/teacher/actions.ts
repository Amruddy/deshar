"use server";

import { revalidatePath } from "next/cache";
import {
  createTeacherHomework as insertTeacherHomework,
  createTeacherLessonHomework,
  createTeacherLessonMaterial,
  createTeacherMaterial as insertTeacherMaterial,
  createTeacherProgressError,
  createTeacherProgressRecord,
  createTeacherProgressRule,
  saveTeacherGroupJournal,
  saveTeacherLessonDetails,
  saveTeacherLessonJournal,
  updateTeacherHomeworkStatus,
  updateTeacherMaterialStatus,
  updateTeacherProgressError,
  updateTeacherProgressRule,
} from "@/app/lib/data/teacher-write";
import { requireWorkspace } from "@/app/lib/dev-auth";

async function requireTeacher() {
  return requireWorkspace("teacher");
}

export async function saveLessonJournal(lessonId: string, formData: FormData) {
  const session = await requireTeacher();
  const result = await saveTeacherLessonJournal({
    email: session.email,
    formData,
    lessonId,
    organizationId: session.organizationId,
  });

  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/teacher/groups/${result.groupId}`);
  revalidatePath(`/teacher/groups/${result.groupId}/journal`);
}

export async function saveLessonDetails(lessonId: string, formData: FormData) {
  const session = await requireTeacher();
  const result = await saveTeacherLessonDetails({
    email: session.email,
    formData,
    lessonId,
    organizationId: session.organizationId,
  });

  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/teacher/groups/${result.groupId}`);
  revalidatePath(`/teacher/groups/${result.groupId}/journal`);
}

export async function saveGroupJournal(groupId: string, formData: FormData) {
  const session = await requireTeacher();
  await saveTeacherGroupJournal({
    email: session.email,
    formData,
    groupId,
    organizationId: session.organizationId,
  });
  revalidatePath(`/teacher/groups/${groupId}/journal`);
}

export async function createProgressRule(studentId: string, formData: FormData) {
  const session = await requireTeacher();
  await createTeacherProgressRule({
    email: session.email,
    formData,
    organizationId: session.organizationId,
    studentId,
  });
  revalidatePath(`/teacher/students/${studentId}`);
  revalidatePath("/student/progress");
}

export async function updateProgressRule(ruleId: string, studentId: string, formData: FormData) {
  const session = await requireTeacher();
  await updateTeacherProgressRule({
    email: session.email,
    formData,
    organizationId: session.organizationId,
    ruleId,
    studentId,
  });
  revalidatePath(`/teacher/students/${studentId}`);
  revalidatePath("/student/progress");
}

export async function createProgressError(studentId: string, formData: FormData) {
  const session = await requireTeacher();
  await createTeacherProgressError({
    email: session.email,
    formData,
    organizationId: session.organizationId,
    studentId,
  });
  revalidatePath(`/teacher/students/${studentId}`);
  revalidatePath("/student/progress");
}

export async function updateProgressError(errorId: string, studentId: string, formData: FormData) {
  const session = await requireTeacher();
  await updateTeacherProgressError({
    email: session.email,
    errorId,
    formData,
    organizationId: session.organizationId,
    studentId,
  });
  revalidatePath(`/teacher/students/${studentId}`);
  revalidatePath("/student/progress");
}

export async function createProgressRecord(studentId: string, lessonId: string | null, formData: FormData) {
  const session = await requireTeacher();
  await createTeacherProgressRecord({
    email: session.email,
    formData,
    lessonId,
    organizationId: session.organizationId,
    studentId,
  });
  revalidatePath(`/teacher/students/${studentId}`);
  revalidatePath("/student/progress");

  if (lessonId) {
    revalidatePath(`/teacher/lessons/${lessonId}`);
  }
}

export async function createLessonProgress(lessonId: string, formData: FormData) {
  void formData;
  await requireTeacher();
  revalidatePath(`/teacher/lessons/${lessonId}`);
}

export async function createLessonHomework(lessonId: string, formData: FormData) {
  const session = await requireTeacher();
  const result = await createTeacherLessonHomework({
    email: session.email,
    formData,
    lessonId,
    organizationId: session.organizationId,
  });

  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/teacher/groups/${result.groupId}`);
  revalidatePath(`/teacher/groups/${result.groupId}/journal`);
  revalidatePath("/teacher/homework");
  revalidatePath("/student");
  revalidatePath("/student/homework");
}

export async function createGroupHomework(groupId: string, formData: FormData) {
  const session = await requireTeacher();
  await insertTeacherHomework({
    email: session.email,
    formData,
    groupId,
    organizationId: session.organizationId,
  });
  revalidatePath(`/teacher/groups/${groupId}`);
  revalidatePath("/teacher/homework");
  revalidatePath("/student");
  revalidatePath("/student/homework");
}

export async function createTeacherHomework(formData: FormData) {
  const session = await requireTeacher();
  await insertTeacherHomework({
    email: session.email,
    formData,
    organizationId: session.organizationId,
  });
  revalidatePath("/teacher/homework");
  revalidatePath("/student");
  revalidatePath("/student/homework");
}

export async function updateHomeworkStatus(homeworkId: string, formData: FormData) {
  const session = await requireTeacher();
  await updateTeacherHomeworkStatus({
    email: session.email,
    formData,
    homeworkId,
    organizationId: session.organizationId,
  });
  revalidatePath("/teacher/homework");
  revalidatePath("/student");
  revalidatePath("/student/homework");
  revalidatePath("/student/materials");
}

export async function createLessonMaterial(lessonId: string, formData: FormData) {
  const session = await requireTeacher();
  const result = await createTeacherLessonMaterial({
    email: session.email,
    formData,
    lessonId,
    organizationId: session.organizationId,
  });

  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/teacher/groups/${result.groupId}`);
  revalidatePath(`/teacher/groups/${result.groupId}/journal`);
  revalidatePath("/teacher/materials");
  revalidatePath("/student/materials");
}

export async function createGroupMaterial(groupId: string, formData: FormData) {
  const formWithContext = new FormData();

  for (const [key, value] of formData.entries()) {
    formWithContext.append(key, value);
  }

  formWithContext.set("context", `group:${groupId}`);

  const session = await requireTeacher();
  await insertTeacherMaterial({
    email: session.email,
    formData: formWithContext,
    organizationId: session.organizationId,
  });
  revalidatePath(`/teacher/groups/${groupId}`);
  revalidatePath("/teacher/materials");
  revalidatePath("/student/materials");
}

export async function createTeacherMaterial(formData: FormData) {
  const session = await requireTeacher();
  await insertTeacherMaterial({
    email: session.email,
    formData,
    organizationId: session.organizationId,
  });
  revalidatePath("/teacher/materials");
  revalidatePath("/student/materials");
  revalidatePath("/student/homework");
}

export async function updateMaterialStatus(materialId: string, formData: FormData) {
  const session = await requireTeacher();
  await updateTeacherMaterialStatus({
    email: session.email,
    formData,
    materialId,
    organizationId: session.organizationId,
  });
  revalidatePath("/teacher/materials");
  revalidatePath("/student/materials");
  revalidatePath("/student/homework");
}
