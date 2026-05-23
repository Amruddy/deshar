import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/app/lib/supabase/server";

type SaveTeacherGroupJournalInput = {
  email: string;
  formData: FormData;
  groupId: string;
  organizationId: string;
};

type SaveTeacherLessonInput = {
  email: string;
  formData: FormData;
  lessonId: string;
  organizationId: string;
};

type SaveTeacherHomeworkInput = {
  email: string;
  formData: FormData;
  groupId?: string;
  organizationId: string;
};

type UpdateTeacherHomeworkStatusInput = {
  email: string;
  formData: FormData;
  homeworkId: string;
  organizationId: string;
};

type SaveTeacherMaterialInput = {
  email: string;
  formData: FormData;
  organizationId: string;
};

type UpdateTeacherMaterialStatusInput = {
  email: string;
  formData: FormData;
  materialId: string;
  organizationId: string;
};

type SaveTeacherStudentProgressInput = {
  email: string;
  formData: FormData;
  organizationId: string;
  studentId: string;
};

type UpdateTeacherProgressRuleInput = SaveTeacherStudentProgressInput & {
  ruleId: string;
};

type UpdateTeacherProgressErrorInput = SaveTeacherStudentProgressInput & {
  errorId: string;
};

type TeacherUserRow = {
  id: string;
};

type TeacherGroupRow = {
  course_id: string;
  id: string;
  teacher_id: string | null;
};

type TeacherLessonGroupRow = {
  course_id: string;
  id: string;
  teacher_id: string | null;
};

type TeacherProgressGroupRow = {
  course_id: string;
  id: string;
};

type TeacherHomeworkRow = {
  course_id: string;
  group_id: string | null;
  id: string;
  lesson_id: string | null;
  student_id: string | null;
};

type TeacherMaterialRow = {
  course_id: string | null;
  group_id: string | null;
  homework_id: string | null;
  id: string;
  lesson_id: string | null;
  student_id: string | null;
};

type TeacherLessonRow = {
  course_id: string;
  group_id: string | null;
  id: string;
  teacher_id: string;
};

type TeacherCourseRow = {
  id: string;
  lesson_mark_scale: string | null;
};

type LessonIdRow = {
  id: string;
};

type GroupStudentStatusRow = {
  student_id: string;
  status: string;
};

type ExistingJournalEntryRow = {
  id: string;
  lesson_id: string;
  student_id: string;
};

type ExistingLessonJournalEntryRow = {
  id: string;
  lesson_id: string;
  student_id: string;
};

type AttendanceMark = "absent" | "excused" | "present" | null;

type JournalSubmission = {
  lessonId: string;
  rawMark: string;
  studentId: string;
};

type TeacherLessonContext = {
  course: TeacherCourseRow;
  group: TeacherLessonGroupRow;
  lesson: TeacherLessonRow;
  teacher: TeacherUserRow;
};

type TeacherStudentProgressContext = {
  courseIds: Set<string>;
  groupIds: Set<string>;
  studentId: string;
  teacher: TeacherUserRow;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertWriteSuccess(error: { message: string } | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

function assertUuid(value: string, context: string) {
  if (!UUID_PATTERN.test(value)) {
    throw new Error(`${context}: неверный идентификатор.`);
  }
}

function parseAttendanceMark(value: string): AttendanceMark {
  if (value === "") {
    return null;
  }

  if (value === "present" || value === "absent" || value === "excused") {
    return value;
  }

  throw new Error("Журнал: неверная отметка посещаемости.");
}

function attendanceMarkToManualValue(value: string) {
  if (value === "present") {
    return "П";
  }

  if (value === "absent") {
    return "Н";
  }

  if (value === "excused") {
    return "У";
  }

  return "";
}

function parseManualJournalMark(value: string, scale: string | null | undefined) {
  const normalized = value.trim().toLowerCase();

  if (normalized.length === 0) {
    return { attendanceMark: null, lessonMark: null };
  }

  if (normalized === "п" || normalized === "p") {
    return { attendanceMark: "present" as const, lessonMark: null };
  }

  if (normalized === "н" || normalized === "n") {
    return { attendanceMark: "absent" as const, lessonMark: null };
  }

  if (normalized === "у" || normalized === "u") {
    return { attendanceMark: "excused" as const, lessonMark: null };
  }

  return { attendanceMark: null, lessonMark: parseLessonMark(normalized, scale) };
}

function journalKey(lessonId: string, studentId: string) {
  return `${lessonId}:${studentId}`;
}

function parseJournalSubmissions(formData: FormData) {
  const submissions = new Map<string, JournalSubmission>();

  for (const [field, value] of formData.entries()) {
    const isManualMark = field.startsWith("mark__");
    const isLegacyAttendance = field.startsWith("attendance__");

    if (!isManualMark && !isLegacyAttendance) {
      continue;
    }

    if (typeof value !== "string") {
      throw new Error("Журнал: неверное значение ячейки.");
    }

    const [, lessonId, studentId] = field.split("__");

    if (!lessonId || !studentId) {
      throw new Error("Журнал: неверная ячейка.");
    }

    assertUuid(lessonId, "Урок журнала");
    assertUuid(studentId, "Ученик журнала");

    const rawMark = isLegacyAttendance ? attendanceMarkToManualValue(value) : value.trim();

    submissions.set(journalKey(lessonId, studentId), {
      lessonId,
      rawMark,
      studentId,
    });
  }

  return [...submissions.values()];
}

function formText(formData: FormData, name: string, label: string) {
  const value = formData.get(name);

  if (value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw new Error(`${label}: неверное значение.`);
  }

  return value.trim();
}

function nullableText(formData: FormData, name: string, label: string) {
  const value = formText(formData, name, label);

  return value.length > 0 ? value : null;
}

function requiredText(formData: FormData, name: string, label: string) {
  const value = formText(formData, name, label);

  if (value.length === 0) {
    throw new Error(`${label}: обязательное поле.`);
  }

  return value;
}

function parseCheckbox(formData: FormData, name: string, label: string) {
  const value = formData.get(name);

  if (value === null) {
    return false;
  }

  if (typeof value !== "string") {
    throw new Error(`${label}: неверное значение.`);
  }

  return value === "true" || value === "on";
}

function lessonMarkValuesForScale(scale: string | null | undefined) {
  if (scale === "five_point") {
    return new Set(["1", "2", "3", "4", "5"]);
  }

  if (scale === "ten_point") {
    return new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
  }

  return new Set<string>();
}

function parseLessonMark(value: string, scale: string | null | undefined) {
  if (value.length === 0) {
    return null;
  }

  const allowedValues = lessonMarkValuesForScale(scale);

  if (!allowedValues.has(value)) {
    throw new Error("Оценка за урок: неверное значение.");
  }

  return value;
}

function parseMaterialType(value: string) {
  if (value === "text" || value === "link") {
    return value;
  }

  throw new Error("Материал: неверный тип.");
}

function parseVisibility(value: string) {
  if (value === "teacher_only" || value === "visible_to_students") {
    return value;
  }

  throw new Error("Материал: неверная видимость.");
}

function parseHomeworkStatus(value: string) {
  if (value === "active" || value === "cancelled" || value === "archived") {
    return value;
  }

  throw new Error("Домашнее задание: неверный статус.");
}

function parseMaterialStatus(value: string) {
  if (value === "active" || value === "hidden" || value === "archived") {
    return value;
  }

  throw new Error("Материал: неверный статус.");
}

function parseDueAt(formData: FormData) {
  const value = formText(formData, "due_date", "Срок домашнего задания");

  if (value.length === 0) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Срок домашнего задания: неверная дата.");
  }

  return new Date(`${value}T00:00:00+03:00`).toISOString();
}

function parseProgressLevel(value: string) {
  if (value === "") {
    return null;
  }

  if (value === "excellent" || value === "good" || value === "satisfactory" || value === "poor") {
    return value;
  }

  throw new Error("Уровень прогресса: неверное значение.");
}

function optionalUuid(value: string, context: string) {
  if (value.length === 0) {
    return null;
  }

  assertUuid(value, context);
  return value;
}

async function getTeacherByEmail(supabase: SupabaseClient, email: string) {
  const teacherResult = await supabase.from("users").select("id").eq("email", email).maybeSingle();

  assertWriteSuccess(teacherResult.error, "Проверка преподавателя");

  const teacher = teacherResult.data as TeacherUserRow | null;

  if (!teacher) {
    throw new Error("Проверка преподавателя: пользователь не найден.");
  }

  return teacher;
}

async function getTeacherLessonContext(supabase: SupabaseClient, input: SaveTeacherLessonInput): Promise<TeacherLessonContext> {
  assertUuid(input.lessonId, "Урок");

  const teacher = await getTeacherByEmail(supabase, input.email);
  const lessonResult = await supabase
    .from("lessons")
    .select("id,course_id,group_id,teacher_id")
    .eq("id", input.lessonId)
    .eq("organization_id", input.organizationId)
    .maybeSingle();

  assertWriteSuccess(lessonResult.error, "Проверка урока");

  const lesson = lessonResult.data as TeacherLessonRow | null;

  if (!lesson || lesson.teacher_id !== teacher.id || !lesson.group_id) {
    throw new Error("Урок: запись не найдена.");
  }

  const [groupResult, courseResult] = await Promise.all([
    supabase
      .from("groups")
      .select("id,course_id,teacher_id")
      .eq("id", lesson.group_id)
      .eq("organization_id", input.organizationId)
      .maybeSingle(),
    supabase
      .from("courses")
      .select("id,lesson_mark_scale")
      .eq("id", lesson.course_id)
      .eq("organization_id", input.organizationId)
      .maybeSingle(),
  ]);

  assertWriteSuccess(groupResult.error, "Проверка группы урока");
  assertWriteSuccess(courseResult.error, "Проверка курса урока");

  const group = groupResult.data as TeacherLessonGroupRow | null;
  const course = courseResult.data as TeacherCourseRow | null;

  if (!group || group.teacher_id !== teacher.id || group.course_id !== lesson.course_id || !course) {
    throw new Error("Урок: запись не найдена.");
  }

  return { course, group, lesson, teacher };
}

async function getTeacherStudentProgressContext(
  supabase: SupabaseClient,
  input: SaveTeacherStudentProgressInput,
): Promise<TeacherStudentProgressContext> {
  assertUuid(input.studentId, "Ученик");

  const teacher = await getTeacherByEmail(supabase, input.email);
  const groupsResult = await supabase
    .from("groups")
    .select("id,course_id")
    .eq("organization_id", input.organizationId)
    .eq("teacher_id", teacher.id);

  assertWriteSuccess(groupsResult.error, "Проверка групп преподавателя");

  const groups = (groupsResult.data ?? []) as TeacherProgressGroupRow[];
  const groupIds = groups.map((group) => group.id);
  const membershipsResult =
    groupIds.length > 0
      ? await supabase
          .from("group_students")
          .select("student_id,status,group_id")
          .in("group_id", groupIds)
          .eq("student_id", input.studentId)
      : { data: [], error: null };

  assertWriteSuccess(membershipsResult.error, "Проверка ученика преподавателя");

  const activeGroupIds = new Set(
    ((membershipsResult.data ?? []) as Array<GroupStudentStatusRow & { group_id: string }>)
      .filter((membership) => membership.status === "active")
      .map((membership) => membership.group_id),
  );

  if (activeGroupIds.size === 0) {
    throw new Error("Ученик: запись не найдена.");
  }

  const courseIds = new Set(
    groups
      .filter((group) => activeGroupIds.has(group.id))
      .map((group) => group.course_id),
  );

  return {
    courseIds,
    groupIds: activeGroupIds,
    studentId: input.studentId,
    teacher,
  };
}

function assertAllowedCourse(courseId: string, context: TeacherStudentProgressContext) {
  assertUuid(courseId, "Курс прогресса");

  if (!context.courseIds.has(courseId)) {
    throw new Error("Прогресс: курс не относится к ученику преподавателя.");
  }
}

async function assertAllowedLesson(
  supabase: SupabaseClient,
  context: TeacherStudentProgressContext,
  organizationId: string,
  lessonId: string | null,
  courseId: string,
) {
  if (!lessonId) {
    return;
  }

  const lessonResult = await supabase
    .from("lessons")
    .select("id,course_id,group_id,teacher_id")
    .eq("id", lessonId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  assertWriteSuccess(lessonResult.error, "Проверка урока прогресса");

  const lesson = lessonResult.data as TeacherLessonRow | null;

  if (
    !lesson ||
    lesson.teacher_id !== context.teacher.id ||
    lesson.course_id !== courseId ||
    !lesson.group_id ||
    !context.groupIds.has(lesson.group_id)
  ) {
    throw new Error("Прогресс: урок не относится к ученику преподавателя.");
  }
}

async function getTeacherGroupContext(
  supabase: SupabaseClient,
  email: string,
  organizationId: string,
  groupId: string,
) {
  assertUuid(groupId, "Группа");

  const teacher = await getTeacherByEmail(supabase, email);
  const groupResult = await supabase
    .from("groups")
    .select("id,course_id,teacher_id")
    .eq("id", groupId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  assertWriteSuccess(groupResult.error, "Проверка группы преподавателя");

  const group = groupResult.data as TeacherLessonGroupRow | null;

  if (!group || group.teacher_id !== teacher.id) {
    throw new Error("Группа: запись не найдена.");
  }

  return { group, teacher };
}

async function assertActiveGroupStudent(supabase: SupabaseClient, groupId: string, studentId: string | null) {
  if (!studentId) {
    return;
  }

  assertUuid(studentId, "Ученик");

  const membershipResult = await supabase
    .from("group_students")
    .select("student_id,status")
    .eq("group_id", groupId)
    .eq("student_id", studentId)
    .maybeSingle();

  assertWriteSuccess(membershipResult.error, "Проверка ученика задания");

  const membership = membershipResult.data as GroupStudentStatusRow | null;

  if (!membership || membership.status !== "active") {
    throw new Error("Ученик задания: ученик не входит в активный состав группы.");
  }
}

async function assertLessonForGroup(
  supabase: SupabaseClient,
  organizationId: string,
  group: TeacherLessonGroupRow,
  teacher: TeacherUserRow,
  lessonId: string | null,
) {
  if (!lessonId) {
    return;
  }

  assertUuid(lessonId, "Урок");

  const lessonResult = await supabase
    .from("lessons")
    .select("id,course_id,group_id,teacher_id")
    .eq("id", lessonId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  assertWriteSuccess(lessonResult.error, "Проверка урока задания");

  const lesson = lessonResult.data as TeacherLessonRow | null;

  if (!lesson || lesson.teacher_id !== teacher.id || lesson.group_id !== group.id || lesson.course_id !== group.course_id) {
    throw new Error("Урок задания: урок не относится к выбранной группе.");
  }
}

async function assertTeacherHomeworkAccess(
  supabase: SupabaseClient,
  email: string,
  organizationId: string,
  homeworkId: string,
) {
  assertUuid(homeworkId, "Домашнее задание");

  const teacher = await getTeacherByEmail(supabase, email);
  const homeworkResult = await supabase
    .from("homework")
    .select("id,course_id,group_id,student_id,lesson_id")
    .eq("id", homeworkId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  assertWriteSuccess(homeworkResult.error, "Проверка домашнего задания");

  const homework = homeworkResult.data as TeacherHomeworkRow | null;

  if (!homework) {
    throw new Error("Домашнее задание: запись не найдена.");
  }

  if (homework.group_id) {
    await getTeacherGroupContext(supabase, email, organizationId, homework.group_id);
    return { homework, teacher };
  }

  if (homework.lesson_id) {
    const lessonResult = await supabase
      .from("lessons")
      .select("id,course_id,group_id,teacher_id")
      .eq("id", homework.lesson_id)
      .eq("organization_id", organizationId)
      .maybeSingle();

    assertWriteSuccess(lessonResult.error, "Проверка урока домашнего задания");

    const lesson = lessonResult.data as TeacherLessonRow | null;

    if (lesson && lesson.teacher_id === teacher.id) {
      return { homework, teacher };
    }
  }

  if (homework.student_id) {
    const groupsResult = await supabase
      .from("groups")
      .select("id,course_id")
      .eq("organization_id", organizationId)
      .eq("teacher_id", teacher.id)
      .eq("course_id", homework.course_id);

    assertWriteSuccess(groupsResult.error, "Проверка групп домашнего задания");

    const groupIds = ((groupsResult.data ?? []) as TeacherProgressGroupRow[]).map((group) => group.id);
    const membershipResult =
      groupIds.length > 0
        ? await supabase
            .from("group_students")
            .select("student_id,status")
            .in("group_id", groupIds)
            .eq("student_id", homework.student_id)
            .eq("status", "active")
            .limit(1)
        : { data: [], error: null };

    assertWriteSuccess(membershipResult.error, "Проверка ученика домашнего задания");

    if ((membershipResult.data ?? []).length > 0) {
      return { homework, teacher };
    }
  }

  throw new Error("Домашнее задание: запись не найдена.");
}

async function resolveTeacherMaterialContext(
  supabase: SupabaseClient,
  input: SaveTeacherMaterialInput,
) {
  const contextValue = requiredText(input.formData, "context", "Учебный контекст материала");
  const [kind, id, secondaryId] = contextValue.split(":");

  if (!id) {
    throw new Error("Материал: неверный учебный контекст.");
  }

  if (kind === "course") {
    assertUuid(id, "Курс материала");

    const teacher = await getTeacherByEmail(supabase, input.email);
    const groupsResult = await supabase
      .from("groups")
      .select("id,course_id")
      .eq("organization_id", input.organizationId)
      .eq("teacher_id", teacher.id)
      .eq("course_id", id)
      .limit(1);

    assertWriteSuccess(groupsResult.error, "Проверка курса материала");

    if ((groupsResult.data ?? []).length === 0) {
      throw new Error("Материал: курс не относится к группам преподавателя.");
    }

    return { course_id: id, created_by: teacher.id };
  }

  if (kind === "group") {
    const { group, teacher } = await getTeacherGroupContext(supabase, input.email, input.organizationId, id);

    return { course_id: group.course_id, created_by: teacher.id, group_id: group.id };
  }

  if (kind === "lesson") {
    assertUuid(id, "Урок материала");

    const teacher = await getTeacherByEmail(supabase, input.email);
    const lessonResult = await supabase
      .from("lessons")
      .select("id,course_id,group_id,teacher_id")
      .eq("id", id)
      .eq("organization_id", input.organizationId)
      .maybeSingle();

    assertWriteSuccess(lessonResult.error, "Проверка урока материала");

    const lesson = lessonResult.data as TeacherLessonRow | null;

    if (!lesson || lesson.teacher_id !== teacher.id || !lesson.group_id) {
      throw new Error("Материал: урок не относится к преподавателю.");
    }

    return {
      course_id: lesson.course_id,
      created_by: teacher.id,
      group_id: lesson.group_id,
      lesson_id: lesson.id,
    };
  }

  if (kind === "homework") {
    const { homework, teacher } = await assertTeacherHomeworkAccess(supabase, input.email, input.organizationId, id);

    return {
      course_id: homework.course_id,
      created_by: teacher.id,
      group_id: homework.group_id,
      homework_id: homework.id,
      lesson_id: homework.lesson_id,
      student_id: homework.student_id,
    };
  }

  if (kind === "student") {
    if (!secondaryId) {
      throw new Error("Материал: для ученика нужно выбрать группу.");
    }

    const { group, teacher } = await getTeacherGroupContext(supabase, input.email, input.organizationId, secondaryId);
    await assertActiveGroupStudent(supabase, group.id, id);

    return {
      course_id: group.course_id,
      created_by: teacher.id,
      group_id: group.id,
      student_id: id,
    };
  }

  throw new Error("Материал: неверный учебный контекст.");
}

async function assertTeacherMaterialAccess(
  supabase: SupabaseClient,
  email: string,
  organizationId: string,
  materialId: string,
) {
  assertUuid(materialId, "Материал");

  const teacher = await getTeacherByEmail(supabase, email);
  const materialResult = await supabase
    .from("materials")
    .select("id,course_id,group_id,student_id,lesson_id,homework_id")
    .eq("id", materialId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  assertWriteSuccess(materialResult.error, "Проверка материала");

  const material = materialResult.data as TeacherMaterialRow | null;

  if (!material) {
    throw new Error("Материал: запись не найдена.");
  }

  if (material.group_id) {
    await getTeacherGroupContext(supabase, email, organizationId, material.group_id);
    return { material, teacher };
  }

  if (material.lesson_id) {
    const lessonResult = await supabase
      .from("lessons")
      .select("id,course_id,group_id,teacher_id")
      .eq("id", material.lesson_id)
      .eq("organization_id", organizationId)
      .maybeSingle();

    assertWriteSuccess(lessonResult.error, "Проверка урока материала");

    const lesson = lessonResult.data as TeacherLessonRow | null;

    if (lesson && lesson.teacher_id === teacher.id) {
      return { material, teacher };
    }
  }

  if (material.homework_id) {
    await assertTeacherHomeworkAccess(supabase, email, organizationId, material.homework_id);
    return { material, teacher };
  }

  if (material.course_id) {
    const groupsResult = await supabase
      .from("groups")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("teacher_id", teacher.id)
      .eq("course_id", material.course_id)
      .limit(1);

    assertWriteSuccess(groupsResult.error, "Проверка курса материала");

    if ((groupsResult.data ?? []).length > 0) {
      return { material, teacher };
    }
  }

  if (material.student_id) {
    const groupsResult = await supabase
      .from("groups")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("teacher_id", teacher.id);

    assertWriteSuccess(groupsResult.error, "Проверка групп материала");

    const groupIds = ((groupsResult.data ?? []) as Array<{ id: string }>).map((group) => group.id);
    const membershipResult =
      groupIds.length > 0
        ? await supabase
            .from("group_students")
            .select("student_id,status")
            .in("group_id", groupIds)
            .eq("student_id", material.student_id)
            .eq("status", "active")
            .limit(1)
        : { data: [], error: null };

    assertWriteSuccess(membershipResult.error, "Проверка ученика материала");

    if ((membershipResult.data ?? []).length > 0) {
      return { material, teacher };
    }
  }

  throw new Error("Материал: запись не найдена.");
}

export async function saveTeacherGroupJournal(input: SaveTeacherGroupJournalInput) {
  const submissions = parseJournalSubmissions(input.formData);
  const supabase = createSupabaseAdminClient();
  const teacherResult = await supabase.from("users").select("id").eq("email", input.email).maybeSingle();

  assertWriteSuccess(teacherResult.error, "Проверка преподавателя");

  const teacher = teacherResult.data as TeacherUserRow | null;

  if (!teacher) {
    throw new Error("Проверка преподавателя: пользователь не найден.");
  }

  const groupResult = await supabase
    .from("groups")
    .select("id,course_id,teacher_id")
    .eq("id", input.groupId)
    .eq("organization_id", input.organizationId)
    .maybeSingle();

  assertWriteSuccess(groupResult.error, "Проверка группы журнала");

  const group = groupResult.data as TeacherGroupRow | null;

  if (!group || group.teacher_id !== teacher.id) {
    throw new Error("Журнал группы: группа не найдена.");
  }

  if (submissions.length === 0) {
    return 0;
  }

  const lessonIds = [...new Set(submissions.map((submission) => submission.lessonId))];
  const studentIds = [...new Set(submissions.map((submission) => submission.studentId))];
  const [lessonsResult, groupStudentsResult, courseResult, existingEntriesResult] = await Promise.all([
    supabase
      .from("lessons")
      .select("id")
      .eq("organization_id", input.organizationId)
      .eq("group_id", input.groupId)
      .in("id", lessonIds),
    supabase.from("group_students").select("student_id,status").eq("group_id", input.groupId).in("student_id", studentIds),
    supabase
      .from("courses")
      .select("id,lesson_mark_scale")
      .eq("id", group.course_id)
      .eq("organization_id", input.organizationId)
      .maybeSingle(),
    supabase.from("journal_entries").select("id,lesson_id,student_id").in("lesson_id", lessonIds).in("student_id", studentIds),
  ]);

  assertWriteSuccess(lessonsResult.error, "Проверка уроков журнала");
  assertWriteSuccess(groupStudentsResult.error, "Проверка учеников журнала");
  assertWriteSuccess(courseResult.error, "Проверка курса журнала");
  assertWriteSuccess(existingEntriesResult.error, "Проверка существующих отметок журнала");

  const course = courseResult.data as TeacherCourseRow | null;

  if (!course) {
    throw new Error("Журнал группы: курс не найден.");
  }

  const validLessonIds = new Set(((lessonsResult.data ?? []) as LessonIdRow[]).map((lesson) => lesson.id));
  const validStudentIds = new Set(
    ((groupStudentsResult.data ?? []) as GroupStudentStatusRow[])
      .filter((student) => student.status === "active")
      .map((student) => student.student_id),
  );

  if (validLessonIds.size !== lessonIds.length) {
    throw new Error("Журнал группы: один из уроков не относится к этой группе.");
  }

  if (validStudentIds.size !== studentIds.length) {
    throw new Error("Журнал группы: один из учеников не входит в активный состав группы.");
  }

  const existingEntryKeys = new Set(
    ((existingEntriesResult.data ?? []) as ExistingJournalEntryRow[]).map((entry) =>
      journalKey(entry.lesson_id, entry.student_id),
    ),
  );
  const updatedAt = new Date().toISOString();
  const payload = submissions
    .map((submission) => {
      const parsedMark = parseManualJournalMark(submission.rawMark, course.lesson_mark_scale);
      const key = journalKey(submission.lessonId, submission.studentId);

      if (parsedMark.attendanceMark === null && parsedMark.lessonMark === null && !existingEntryKeys.has(key)) {
        return null;
      }

      return {
        attendance_mark: parsedMark.attendanceMark,
        lesson_id: submission.lessonId,
        lesson_mark: parsedMark.lessonMark,
        student_id: submission.studentId,
        updated_at: updatedAt,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (payload.length === 0) {
    return 0;
  }

  const result = await supabase.from("journal_entries").upsert(payload, { onConflict: "lesson_id,student_id" });

  assertWriteSuccess(result.error, "Сохранение журнала группы");

  return payload.length;
}

export async function saveTeacherLessonDetails(input: SaveTeacherLessonInput) {
  const supabase = createSupabaseAdminClient();
  const context = await getTeacherLessonContext(supabase, input);
  const result = await supabase
    .from("lessons")
    .update({
      summary: nullableText(input.formData, "summary", "Комментарий урока"),
      topic: nullableText(input.formData, "topic", "Тема урока"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", context.lesson.id)
    .eq("organization_id", input.organizationId)
    .select("id")
    .maybeSingle();

  assertWriteSuccess(result.error, "Сохранение урока");

  if (!result.data) {
    throw new Error("Сохранение урока: запись не найдена.");
  }

  return { groupId: context.group.id };
}

export async function saveTeacherLessonJournal(input: SaveTeacherLessonInput) {
  const supabase = createSupabaseAdminClient();
  const context = await getTeacherLessonContext(supabase, input);
  const groupStudentsResult = await supabase
    .from("group_students")
    .select("student_id,status")
    .eq("group_id", context.group.id);

  assertWriteSuccess(groupStudentsResult.error, "Проверка учеников урока");

  const activeGroupStudents = ((groupStudentsResult.data ?? []) as GroupStudentStatusRow[]).filter(
    (student) => student.status === "active",
  );
  const activeStudentIds = activeGroupStudents.map((student) => student.student_id);

  if (activeStudentIds.length === 0) {
    return { count: 0, groupId: context.group.id };
  }

  const existingEntriesResult = await supabase
    .from("journal_entries")
    .select("id,lesson_id,student_id")
    .eq("lesson_id", context.lesson.id)
    .in("student_id", activeStudentIds);

  assertWriteSuccess(existingEntriesResult.error, "Проверка существующих записей урока");

  const existingEntryKeys = new Set(
    ((existingEntriesResult.data ?? []) as ExistingLessonJournalEntryRow[]).map((entry) =>
      journalKey(entry.lesson_id, entry.student_id),
    ),
  );
  const updatedAt = new Date().toISOString();
  const payload = activeStudentIds
    .map((studentId) => {
      const attendanceMark = parseAttendanceMark(formText(input.formData, `attendance__${studentId}`, "Посещаемость"));
      const lessonMark = parseLessonMark(
        formText(input.formData, `lesson_mark__${studentId}`, "Оценка за урок"),
        context.course.lesson_mark_scale,
      );
      const teacherComment = nullableText(input.formData, `teacher_comment__${studentId}`, "Комментарий ученику");
      const internalComment = nullableText(input.formData, `internal_comment__${studentId}`, "Внутренний комментарий");
      const isVisibleToStudent = parseCheckbox(input.formData, `visible__${studentId}`, "Видимость комментария");
      const key = journalKey(context.lesson.id, studentId);
      const hasValue =
        attendanceMark !== null ||
        lessonMark !== null ||
        teacherComment !== null ||
        internalComment !== null ||
        isVisibleToStudent;

      if (!hasValue && !existingEntryKeys.has(key)) {
        return null;
      }

      return {
        attendance_mark: attendanceMark,
        internal_comment: internalComment,
        is_visible_to_student: isVisibleToStudent,
        lesson_id: context.lesson.id,
        lesson_mark: lessonMark,
        student_id: studentId,
        teacher_comment: teacherComment,
        updated_at: updatedAt,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (payload.length === 0) {
    return { count: 0, groupId: context.group.id };
  }

  const result = await supabase.from("journal_entries").upsert(payload, { onConflict: "lesson_id,student_id" });

  assertWriteSuccess(result.error, "Сохранение журнала урока");

  return { count: payload.length, groupId: context.group.id };
}

export async function createTeacherLessonHomework(input: SaveTeacherLessonInput) {
  const supabase = createSupabaseAdminClient();
  const context = await getTeacherLessonContext(supabase, input);
  const result = await supabase.from("homework").insert({
    course_id: context.lesson.course_id,
    created_by: context.teacher.id,
    description: requiredText(input.formData, "description", "Описание домашнего задания"),
    due_at: parseDueAt(input.formData),
    group_id: context.group.id,
    lesson_id: context.lesson.id,
    organization_id: input.organizationId,
    status: "active",
    title: requiredText(input.formData, "title", "Название домашнего задания"),
  });

  assertWriteSuccess(result.error, "Добавление домашнего задания");

  return { groupId: context.group.id };
}

export async function createTeacherLessonMaterial(input: SaveTeacherLessonInput) {
  const supabase = createSupabaseAdminClient();
  const context = await getTeacherLessonContext(supabase, input);
  const type = parseMaterialType(requiredText(input.formData, "type", "Тип материала"));
  const visibility = parseVisibility(requiredText(input.formData, "visibility", "Видимость материала"));
  const content =
    type === "text"
      ? requiredText(input.formData, "content", "Текст материала")
      : nullableText(input.formData, "content", "Текст материала");
  const url = type === "link" ? requiredText(input.formData, "url", "Ссылка материала") : null;
  const result = await supabase.from("materials").insert({
    content,
    course_id: context.lesson.course_id,
    created_by: context.teacher.id,
    group_id: context.group.id,
    lesson_id: context.lesson.id,
    organization_id: input.organizationId,
    status: "active",
    title: requiredText(input.formData, "title", "Название материала"),
    type,
    url,
    visibility,
  });

  assertWriteSuccess(result.error, "Добавление материала");

  return { groupId: context.group.id };
}

export async function createTeacherHomework(input: SaveTeacherHomeworkInput) {
  const supabase = createSupabaseAdminClient();
  const groupId = input.groupId ?? requiredText(input.formData, "group_id", "Группа задания");
  const { group, teacher } = await getTeacherGroupContext(supabase, input.email, input.organizationId, groupId);
  const studentId = optionalUuid(formText(input.formData, "student_id", "Ученик задания"), "Ученик задания");
  const lessonId = optionalUuid(formText(input.formData, "lesson_id", "Урок задания"), "Урок задания");

  await assertActiveGroupStudent(supabase, group.id, studentId);
  await assertLessonForGroup(supabase, input.organizationId, group, teacher, lessonId);

  const result = await supabase.from("homework").insert({
    course_id: group.course_id,
    created_by: teacher.id,
    description: requiredText(input.formData, "description", "Описание домашнего задания"),
    due_at: parseDueAt(input.formData),
    group_id: group.id,
    lesson_id: lessonId,
    organization_id: input.organizationId,
    status: "active",
    student_id: studentId,
    title: requiredText(input.formData, "title", "Название домашнего задания"),
  });

  assertWriteSuccess(result.error, "Добавление домашнего задания");

  return { groupId: group.id, lessonId };
}

export async function updateTeacherHomeworkStatus(input: UpdateTeacherHomeworkStatusInput) {
  const supabase = createSupabaseAdminClient();
  await assertTeacherHomeworkAccess(supabase, input.email, input.organizationId, input.homeworkId);

  const status = parseHomeworkStatus(requiredText(input.formData, "status", "Статус домашнего задания"));
  const result = await supabase
    .from("homework")
    .update({
      archived_at: status === "archived" ? new Date().toISOString() : null,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.homeworkId)
    .eq("organization_id", input.organizationId)
    .select("id")
    .maybeSingle();

  assertWriteSuccess(result.error, "Обновление домашнего задания");

  if (!result.data) {
    throw new Error("Домашнее задание: запись не найдена.");
  }
}

export async function createTeacherMaterial(input: SaveTeacherMaterialInput) {
  const supabase = createSupabaseAdminClient();
  const context = await resolveTeacherMaterialContext(supabase, input);
  const type = parseMaterialType(requiredText(input.formData, "type", "Тип материала"));
  const visibility = parseVisibility(requiredText(input.formData, "visibility", "Видимость материала"));
  const content =
    type === "text"
      ? requiredText(input.formData, "content", "Текст материала")
      : nullableText(input.formData, "content", "Текст материала");
  const url = type === "link" ? requiredText(input.formData, "url", "Ссылка материала") : null;
  const result = await supabase.from("materials").insert({
    ...context,
    content,
    organization_id: input.organizationId,
    status: "active",
    title: requiredText(input.formData, "title", "Название материала"),
    type,
    url,
    visibility,
  });

  assertWriteSuccess(result.error, "Добавление материала");
}

export async function updateTeacherMaterialStatus(input: UpdateTeacherMaterialStatusInput) {
  const supabase = createSupabaseAdminClient();
  await assertTeacherMaterialAccess(supabase, input.email, input.organizationId, input.materialId);

  const status = parseMaterialStatus(requiredText(input.formData, "status", "Статус материала"));
  const result = await supabase
    .from("materials")
    .update({
      archived_at: status === "archived" ? new Date().toISOString() : null,
      status,
      updated_at: new Date().toISOString(),
      visibility: parseVisibility(requiredText(input.formData, "visibility", "Видимость материала")),
    })
    .eq("id", input.materialId)
    .eq("organization_id", input.organizationId)
    .select("id")
    .maybeSingle();

  assertWriteSuccess(result.error, "Обновление материала");

  if (!result.data) {
    throw new Error("Материал: запись не найдена.");
  }
}

export async function createTeacherProgressRule(input: SaveTeacherStudentProgressInput) {
  const supabase = createSupabaseAdminClient();
  const context = await getTeacherStudentProgressContext(supabase, input);
  const courseId = requiredText(input.formData, "course_id", "Курс прогресса");

  assertAllowedCourse(courseId, context);

  const result = await supabase.from("student_progress_rules").insert({
    course_id: courseId,
    is_active: true,
    is_visible_to_student: parseCheckbox(input.formData, "is_visible_to_student", "Видимость правила"),
    level: parseProgressLevel(formText(input.formData, "level", "Уровень правила")),
    name: requiredText(input.formData, "name", "Название правила"),
    note: nullableText(input.formData, "note", "Комментарий правила"),
    organization_id: input.organizationId,
    sort_order: 0,
    student_id: context.studentId,
  });

  assertWriteSuccess(result.error, "Добавление правила прогресса");
}

export async function updateTeacherProgressRule(input: UpdateTeacherProgressRuleInput) {
  const supabase = createSupabaseAdminClient();
  const context = await getTeacherStudentProgressContext(supabase, input);

  assertUuid(input.ruleId, "Правило прогресса");

  const result = await supabase
    .from("student_progress_rules")
    .update({
      is_active: parseCheckbox(input.formData, "is_active", "Активность правила"),
      is_visible_to_student: parseCheckbox(input.formData, "is_visible_to_student", "Видимость правила"),
      level: parseProgressLevel(formText(input.formData, "level", "Уровень правила")),
      name: requiredText(input.formData, "name", "Название правила"),
      note: nullableText(input.formData, "note", "Комментарий правила"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.ruleId)
    .eq("organization_id", input.organizationId)
    .eq("student_id", context.studentId)
    .in("course_id", [...context.courseIds])
    .select("id")
    .maybeSingle();

  assertWriteSuccess(result.error, "Сохранение правила прогресса");

  if (!result.data) {
    throw new Error("Правило прогресса: запись не найдена.");
  }
}

export async function createTeacherProgressError(input: SaveTeacherStudentProgressInput) {
  const supabase = createSupabaseAdminClient();
  const context = await getTeacherStudentProgressContext(supabase, input);
  const courseId = requiredText(input.formData, "course_id", "Курс прогресса");

  assertAllowedCourse(courseId, context);

  const result = await supabase.from("student_progress_errors").insert({
    course_id: courseId,
    is_active: true,
    is_visible_to_student: parseCheckbox(input.formData, "is_visible_to_student", "Видимость ошибки"),
    name: requiredText(input.formData, "name", "Название ошибки"),
    note: nullableText(input.formData, "note", "Комментарий ошибки"),
    organization_id: input.organizationId,
    student_id: context.studentId,
  });

  assertWriteSuccess(result.error, "Добавление ошибки прогресса");
}

export async function updateTeacherProgressError(input: UpdateTeacherProgressErrorInput) {
  const supabase = createSupabaseAdminClient();
  const context = await getTeacherStudentProgressContext(supabase, input);

  assertUuid(input.errorId, "Ошибка прогресса");

  const result = await supabase
    .from("student_progress_errors")
    .update({
      is_active: parseCheckbox(input.formData, "is_active", "Активность ошибки"),
      is_visible_to_student: parseCheckbox(input.formData, "is_visible_to_student", "Видимость ошибки"),
      name: requiredText(input.formData, "name", "Название ошибки"),
      note: nullableText(input.formData, "note", "Комментарий ошибки"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.errorId)
    .eq("organization_id", input.organizationId)
    .eq("student_id", context.studentId)
    .in("course_id", [...context.courseIds])
    .select("id")
    .maybeSingle();

  assertWriteSuccess(result.error, "Сохранение ошибки прогресса");

  if (!result.data) {
    throw new Error("Ошибка прогресса: запись не найдена.");
  }
}

export async function createTeacherProgressRecord(input: SaveTeacherStudentProgressInput & { lessonId: string | null }) {
  const supabase = createSupabaseAdminClient();
  const context = await getTeacherStudentProgressContext(supabase, input);
  const courseId = requiredText(input.formData, "course_id", "Курс прогресса");
  const lessonId = input.lessonId ?? optionalUuid(formText(input.formData, "lesson_id", "Урок прогресса"), "Урок прогресса");
  const repeatNote = nullableText(input.formData, "repeat_note", "Что повторить");
  const studentComment = nullableText(input.formData, "student_comment", "Комментарий ученику");
  const internalComment = nullableText(input.formData, "internal_comment", "Внутренний комментарий");

  assertAllowedCourse(courseId, context);
  await assertAllowedLesson(supabase, context, input.organizationId, lessonId, courseId);

  if (!repeatNote && !studentComment && !internalComment) {
    throw new Error("Запись прогресса: заполните что повторить или комментарий.");
  }

  const result = await supabase.from("progress_records").insert({
    course_id: courseId,
    created_by: context.teacher.id,
    internal_comment: internalComment,
    is_visible_to_student: parseCheckbox(input.formData, "is_visible_to_student", "Видимость записи прогресса"),
    lesson_id: lessonId,
    organization_id: input.organizationId,
    repeat_note: repeatNote,
    student_comment: studentComment,
    student_id: context.studentId,
  });

  assertWriteSuccess(result.error, "Добавление записи прогресса");
}
