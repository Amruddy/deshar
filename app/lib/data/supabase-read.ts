import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createSupabaseAdminClient,
  readSupabaseRequestTimeoutMs,
  SupabaseRequestTimeoutError,
  SupabaseServerConfigError,
} from "@/app/lib/supabase/server";

export type DataResult<T> =
  | {
      state: "ready";
      data: T;
    }
  | {
      state: "setup";
      missingEnv: string[];
    }
  | {
      state: "error";
      message: string;
    };

type QueryRowsResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

type QuerySingleResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

type OrganizationRow = {
  id: string;
  name: string;
  timezone: string | null;
};

type UserRow = {
  auth_status: string | null;
  auth_user_id: string | null;
  id: string;
  invited_at?: string | null;
  last_sign_in_at?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
};

type MemberRow = {
  id: string;
  user_id: string;
  roles: string[];
  permissions: string[];
};

type CourseRow = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  format: string;
  lesson_mark_scale: string | null;
  status: string;
};

type CourseProgressSettingsRow = {
  id: string;
  course_id: string;
  name: string;
  is_progress_enabled: boolean;
};

type GroupRow = {
  id: string;
  course_id: string;
  teacher_id: string | null;
  name: string;
  status: string;
};

type GroupStudentRow = {
  id: string;
  group_id: string;
  student_id: string;
  status: string;
  joined_at?: string | null;
  left_at?: string | null;
};

type StudentRow = {
  id: string;
  user_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  status: string;
};

type LessonRow = {
  id: string;
  course_id: string;
  group_id: string | null;
  teacher_id: string;
  starts_at: string;
  ends_at: string;
  summary?: string | null;
  topic: string | null;
};

type ScheduleRuleRow = {
  id: string;
  target_type: string;
  target_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  starts_on: string;
  ends_on: string | null;
  status: string;
};

type HomeworkRow = {
  id: string;
  course_id: string;
  group_id: string | null;
  student_id: string | null;
  lesson_id?: string | null;
  title: string;
  description: string | null;
  due_at: string | null;
  status: string;
};

type MaterialRow = {
  id: string;
  course_id: string | null;
  group_id: string | null;
  student_id: string | null;
  lesson_id?: string | null;
  homework_id?: string | null;
  title: string;
  type: string;
  content: string | null;
  url: string | null;
  visibility: string;
  status: string;
};

type JournalEntryRow = {
  id: string;
  lesson_id: string;
  student_id: string;
  attendance_mark: string | null;
  lesson_mark: string | null;
  teacher_comment: string | null;
  internal_comment: string | null;
  is_visible_to_student: boolean;
};

type ProgressRecordLessonRow = {
  id: string;
  lesson_id: string | null;
  student_id: string;
};

type PaymentRow = {
  id: string;
  organization_id?: string;
  student_id: string;
  course_id: string | null;
  group_id: string | null;
  individual_enrollment_id?: string | null;
  amount: number;
  currency: string;
  period_type?: string;
  period_start: string | null;
  period_end: string | null;
  due_at: string | null;
  status: string;
  comment?: string | null;
  internal_comment?: string | null;
  created_at?: string;
  updated_at?: string;
};

type ProgressRuleRow = {
  id: string;
  student_id: string;
  course_id: string;
  name: string;
  level: string | null;
  note: string | null;
  is_visible_to_student: boolean;
  is_active: boolean;
};

type ProgressErrorRow = {
  id: string;
  student_id: string;
  course_id: string;
  name: string;
  note: string | null;
  is_visible_to_student: boolean;
  is_active: boolean;
};

type ProgressRecordRow = {
  id: string;
  student_id: string;
  course_id: string;
  lesson_id: string | null;
  repeat_note: string | null;
  student_comment: string | null;
  internal_comment: string | null;
  is_visible_to_student: boolean;
  created_at: string;
};

export type MetricItem = {
  label: string;
  value: string;
  detail?: string;
};

export type LessonSummary = {
  id: string;
  title: string;
  subtitle: string;
  when: string;
};

export type PaymentSummary = {
  amountValue?: string;
  id: string;
  studentName: string;
  context: string;
  amount: string;
  comment?: string;
  currency?: string;
  due: string;
  dueAt?: string;
  internalComment?: string;
  periodEnd?: string;
  periodStart?: string;
  periodTypeValue?: string;
  status: string;
};

export type AdminPaymentFilters = {
  groupId?: string;
  period?: string;
  status?: string;
  studentId?: string;
};

export type PaymentDetailItem = {
  amount: string;
  amountValue: string;
  attention: boolean;
  comment: string;
  context: string;
  contextHref: string;
  currency: string;
  due: string;
  dueAt: string;
  groupId: string;
  id: string;
  internalComment: string;
  period: string;
  periodEnd: string;
  periodStart: string;
  periodTypeValue: string;
  status: string;
  statusTone: "danger" | "neutral" | "ok" | "warning";
  statusValue: string;
  studentId: string;
  studentName: string;
};

export type AdminPaymentsData = {
  activeFilters: Required<AdminPaymentFilters>;
  courseOptions: SelectOption[];
  defaultDueAt: string;
  defaultPeriodEnd: string;
  defaultPeriodStart: string;
  groupStudentOptions: GroupStudentSelectOption[];
  groupOptions: SelectOption[];
  metrics: MetricItem[];
  payments: PaymentDetailItem[];
  periodOptions: SelectOption[];
  studentOptions: SelectOption[];
};

export type TeacherPaymentsData = {
  groups: string[];
  metrics: MetricItem[];
  payments: PaymentDetailItem[];
};

export type StudentPaymentsData = {
  metrics: MetricItem[];
  payments: PaymentDetailItem[];
  studentName: string;
};

export type AdminOverviewData = {
  organizationName: string;
  metrics: MetricItem[];
  upcomingLessons: LessonSummary[];
  duePayments: PaymentSummary[];
};

export type AdminCourseItem = {
  id: string;
  name: string;
  description: string;
  format: string;
  status: string;
  groupCount: string;
};

export type AdminCourseDetailGroup = {
  id: string;
  name: string;
  nextLesson: string;
  status: string;
  students: string;
  teacher: string;
};

export type AdminCourseDetailStudent = {
  id: string;
  name: string;
  contacts: string;
  groups: string;
  payment: string;
  status: string;
};

export type AdminCourseMaterialItem = {
  detail: string;
  id: string;
  title: string;
};

export type AdminCourseDetailData = {
  description: string;
  format: string;
  formatValue: string;
  groups: AdminCourseDetailGroup[];
  id: string;
  lessonMarkScale: string;
  lessonMarkScaleValue: string;
  materials: AdminCourseMaterialItem[];
  metrics: MetricItem[];
  name: string;
  paymentSignals: PaymentSummary[];
  progressSettings: {
    enabled: string;
    id: string | null;
    name: string;
  };
  status: string;
  statusValue: string;
  students: AdminCourseDetailStudent[];
  type: string;
};

export type AdminGroupItem = {
  id: string;
  name: string;
  course: string;
  teacher: string;
  status: string;
  students: string;
  nextLesson: string;
};

export type SelectOption = {
  label: string;
  value: string;
};

export type GroupStudentSelectOption = SelectOption & {
  groupId: string;
};

export type AdminGroupsData = {
  groups: AdminGroupItem[];
  courseOptions: SelectOption[];
  groupOptions: SelectOption[];
  studentOptions: SelectOption[];
  teacherOptions: SelectOption[];
};

export type AdminGroupDetailStudent = {
  id: string;
  groupStudentId: string;
  name: string;
  contacts: string;
  joinedAt: string;
  status: string;
};

export type AdminGroupScheduleRule = {
  id: string;
  weekday: string;
  timeRange: string;
  period: string;
};

export type ProblemSignal = {
  detail: string;
  label: string;
  tone: "danger" | "ok" | "warning";
};

export type AdminGroupDetailData = {
  id: string;
  name: string;
  course: string;
  teacher: string;
  teacherId: string | null;
  status: string;
  statusValue: string;
  problemSignals: ProblemSignal[];
  students: AdminGroupDetailStudent[];
  scheduleRules: AdminGroupScheduleRule[];
  upcomingLessons: LessonSummary[];
  studentOptions: SelectOption[];
  teacherOptions: SelectOption[];
};

export type AdminStudentItem = {
  access: string;
  id: string;
  name: string;
  contacts: string;
  status: string;
  groups: string;
  payment: string;
};

export type AdminStudentGroupItem = {
  course: string;
  groupId: string;
  groupStudentId: string;
  joinedAt: string;
  leftAt: string;
  name: string;
  status: string;
  statusValue: string;
  teacher: string;
};

export type AdminStudentLessonHistoryItem = {
  attendance: string;
  comment: string;
  context: string;
  id: string;
  lesson: string;
  when: string;
};

export type AdminStudentDetailData = {
  accessAction: string | null;
  accessDetail: string;
  accessStatus: string;
  accessStatusValue: string;
  contacts: string;
  email: string;
  errors: ProgressErrorItem[];
  groupOptions: SelectOption[];
  groups: AdminStudentGroupItem[];
  homework: TeacherGroupHomeworkItem[];
  id: string;
  lessons: AdminStudentLessonHistoryItem[];
  materials: TeacherGroupMaterialItem[];
  metrics: MetricItem[];
  name: string;
  payments: PaymentDetailItem[];
  phone: string;
  records: ProgressRecordItem[];
  rules: ProgressRuleItem[];
  status: string;
  statusValue: string;
};

export type AdminTeacherItem = {
  activeGroups: string;
  access: string;
  accessAction: string | null;
  accessDetail: string;
  contacts: string;
  groups: string;
  id: string;
  name: string;
  status: string;
  students: string;
  upcomingLessons: string;
};

export type AdminTeachersData = {
  metrics: MetricItem[];
  teachers: AdminTeacherItem[];
};

export type TeacherOverviewData = {
  teacherName: string;
  metrics: MetricItem[];
  upcomingLessons: LessonSummary[];
  attentionPayments: PaymentSummary[];
  journalShortcut: {
    detail: string;
    href: string;
    name: string;
  } | null;
};

export type TeacherGroupItem = {
  id: string;
  name: string;
  course: string;
  status: string;
  students: string;
  nextLesson: string;
  nextLessonId: string | null;
  problems: string;
};

export type TeacherStudentItem = {
  id: string;
  name: string;
  contacts: string;
  groups: string;
  payment: string;
};

export type ProgressRuleItem = {
  course: string;
  courseId: string;
  id: string;
  isActive: boolean;
  isVisibleToStudent: boolean;
  level: string;
  levelValue: string;
  name: string;
  note: string;
};

export type ProgressErrorItem = {
  course: string;
  courseId: string;
  id: string;
  isActive: boolean;
  isVisibleToStudent: boolean;
  name: string;
  note: string;
};

export type ProgressRecordItem = {
  course: string;
  courseId: string;
  createdAt: string;
  id: string;
  internalComment: string;
  isVisibleToStudent: boolean;
  lesson: string;
  lessonId: string | null;
  repeatNote: string;
  studentComment: string;
};

export type TeacherStudentDetailData = {
  contacts: string;
  courseOptions: SelectOption[];
  errors: ProgressErrorItem[];
  groups: string[];
  homework: TeacherGroupHomeworkItem[];
  id: string;
  lessonOptions: SelectOption[];
  lessons: LessonSummary[];
  materials: TeacherGroupMaterialItem[];
  metrics: MetricItem[];
  name: string;
  payments: PaymentSummary[];
  records: ProgressRecordItem[];
  rules: ProgressRuleItem[];
  status: string;
};

export type StudentProgressData = {
  errors: ProgressErrorItem[];
  groups: string[];
  records: ProgressRecordItem[];
  rules: ProgressRuleItem[];
  studentName: string;
};

export type StudentScheduleLesson = {
  course: string;
  date: string;
  group: string;
  id: string;
  startsAt: string;
  status: string;
  teacher: string;
  timeRange: string;
  title: string;
};

export type StudentOverviewData = {
  courses: string[];
  groups: string[];
  homework: StudentHomeworkItem[];
  materials: LearningMaterialItem[];
  nextLesson: StudentScheduleLesson | null;
  payments: PaymentSummary[];
  progress: string[];
  studentName: string;
};

export type StudentScheduleData = {
  groups: string[];
  lessons: StudentScheduleLesson[];
  metrics: MetricItem[];
  studentName: string;
};

export type StudentAttendanceStatus = "absent" | "excused" | "present" | "unknown";

export type StudentAttendanceItem = {
  course: string;
  date: string;
  group: string;
  id: string;
  lesson: string;
  mark: string;
  status: StudentAttendanceStatus;
  teacherComment: string;
  timeRange: string;
};

export type StudentAttendanceData = {
  attendance: StudentAttendanceItem[];
  groups: string[];
  metrics: MetricItem[];
  studentName: string;
};

export type TeacherGroupDetailStudent = {
  id: string;
  name: string;
  contacts: string;
  payment: string;
  status: string;
};

export type TeacherGroupScheduleRule = {
  id: string;
  weekday: string;
  timeRange: string;
  period: string;
};

export type TeacherGroupHomeworkItem = {
  id: string;
  title: string;
  due: string;
  description: string;
};

export type TeacherGroupMaterialItem = {
  id: string;
  title: string;
  detail: string;
};

export type TeacherGroupDetailData = {
  id: string;
  name: string;
  course: string;
  teacher: string;
  status: string;
  metrics: MetricItem[];
  nextLesson: LessonSummary | null;
  problemSignals: ProblemSignal[];
  students: TeacherGroupDetailStudent[];
  scheduleRules: TeacherGroupScheduleRule[];
  recentLessons: LessonSummary[];
  homework: TeacherGroupHomeworkItem[];
  materials: TeacherGroupMaterialItem[];
  paymentSignals: PaymentSummary[];
};

export type TeacherJournalCell = {
  attendanceMark: "" | "absent" | "excused" | "present";
  attendanceTone: "danger" | "neutral" | "ok" | "warning";
  id: string;
  indicators: string[];
  isFuture: boolean;
  lessonId: string;
  markValue: string;
  studentId: string;
};

export type TeacherJournalLesson = {
  id: string;
  day: string;
  isWeekStart: boolean;
  timeRange: string;
  topic: string;
  weekday: string;
};

export type TeacherJournalStudent = {
  id: string;
  name: string;
  status: string;
  cells: TeacherJournalCell[];
};

export type TeacherGroupJournalData = {
  id: string;
  name: string;
  course: string;
  teacher: string;
  status: string;
  monthLabel: string;
  monthValue: string;
  previousMonth: string;
  nextMonth: string;
  lessons: TeacherJournalLesson[];
  students: TeacherJournalStudent[];
  savedEntries: string;
};

export type TeacherLessonJournalEntry = {
  attendanceMark: "" | "absent" | "excused" | "present";
  internalComment: string;
  isVisibleToStudent: boolean;
  lessonMark: string;
  teacherComment: string;
};

export type TeacherLessonStudent = {
  contacts: string;
  hasProgressRecord: boolean;
  id: string;
  journalEntry: TeacherLessonJournalEntry;
  name: string;
  progressHref: string;
  status: string;
};

export type TeacherLessonHomeworkItem = {
  description: string;
  due: string;
  id: string;
  title: string;
};

export type TeacherLessonMaterialItem = {
  content: string;
  detail: string;
  id: string;
  title: string;
  url: string | null;
};

export type TeacherLessonData = {
  course: string;
  group: string;
  groupHref: string;
  homework: TeacherLessonHomeworkItem[];
  id: string;
  journalHref: string;
  lessonMarkOptions: SelectOption[];
  lessonMarkScale: string;
  materials: TeacherLessonMaterialItem[];
  savedEntries: string;
  startsAtLabel: string;
  students: TeacherLessonStudent[];
  summary: string;
  teacher: string;
  timeRange: string;
  topic: string;
};

export type LearningMaterialItem = {
  content: string;
  detail: string;
  id: string;
  title: string;
  url: string | null;
};

export type TeacherHomeworkItem = {
  context: string;
  description: string;
  due: string;
  id: string;
  lesson: string;
  materials: LearningMaterialItem[];
  status: string;
  statusValue: string;
  student: string;
  title: string;
};

export type TeacherHomeworkData = {
  groupOptions: SelectOption[];
  homework: TeacherHomeworkItem[];
  lessonOptions: SelectOption[];
  metrics: MetricItem[];
  studentOptions: SelectOption[];
};

export type TeacherMaterialItem = LearningMaterialItem & {
  context: string;
  status: string;
  statusValue: string;
  visibility: string;
  visibilityValue: string;
};

export type TeacherMaterialsData = {
  contextOptions: SelectOption[];
  materials: TeacherMaterialItem[];
  metrics: MetricItem[];
};

export type StudentHomeworkItem = {
  context: string;
  description: string;
  due: string;
  id: string;
  lesson: string;
  materials: LearningMaterialItem[];
  title: string;
};

export type StudentHomeworkData = {
  groups: string[];
  homework: StudentHomeworkItem[];
  metrics: MetricItem[];
  studentName: string;
};

export type StudentMaterialsData = {
  groups: string[];
  materials: LearningMaterialItem[];
  metrics: MetricItem[];
  studentName: string;
};

async function readSupabaseData<T>(reader: (client: SupabaseClient) => Promise<T>): Promise<DataResult<T>> {
  try {
    const client = createSupabaseAdminClient();
    const data = await withSupabaseTimeout(reader(client));

    return { state: "ready", data };
  } catch (error) {
    if (error instanceof SupabaseServerConfigError) {
      return { state: "setup", missingEnv: error.missingEnv };
    }

    return {
      state: "error",
      message: error instanceof Error ? error.message : "Не удалось прочитать данные Supabase.",
    };
  }
}

async function withSupabaseTimeout<T>(operation: Promise<T>): Promise<T> {
  const timeoutMs = readSupabaseRequestTimeoutMs() * 3 + 1_000;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new SupabaseRequestTimeoutError(timeoutMs)), timeoutMs);
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function rows<T>(result: QueryRowsResult<T>, context: string): T[] {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }

  return result.data ?? [];
}

function single<T>(result: QuerySingleResult<T>, context: string): T {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }

  if (!result.data) {
    throw new Error(`${context}: запись не найдена. Проверьте seed Supabase.`);
  }

  return result.data;
}

function byId<T extends { id: string }>(items: T[]) {
  return new Map(items.map((item) => [item.id, item]));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "не задано";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "Europe/Moscow",
  }).format(new Date(value));
}

function formatDateShort(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    timeZone: "Europe/Moscow",
  }).format(new Date(value));
}

function formatMonthLabel(monthValue: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    timeZone: "Europe/Moscow",
    year: "numeric",
  }).format(new Date(`${monthValue}-01T00:00:00+03:00`));
}

function formatTimeOfDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(new Date(value));
}

function weekdayShortLabel(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    weekday: "short",
  }).format(new Date(value));
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "без срока";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    timeZone: "Europe/Moscow",
  }).format(new Date(value));
}

function formatDateLong(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    timeZone: "Europe/Moscow",
    weekday: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string | null | undefined) {
  if (!value) {
    return "не задано";
  }

  return value.slice(0, 5);
}

function formatMoscowDateValue(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Moscow",
    year: "numeric",
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));

  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function addDaysToDateValue(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  return [
    String(date.getUTCFullYear()),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function weekdayOfDateValue(value: string) {
  return new Date(`${value}T12:00:00+03:00`).getUTCDay();
}

function compareDateValues(left: string, right: string) {
  return left.localeCompare(right);
}

function moscowDateTimeIso(dateValue: string, timeValue: string) {
  return `${dateValue}T${formatTime(timeValue)}:00+03:00`;
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("ru-RU", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    active: "активен",
    archived: "архив",
    completed: "завершен",
    exempt: "льгота",
    overdue: "просрочено",
    paid: "оплачено",
    paused: "пауза",
    pending: "ожидает",
    recruiting: "набор",
  };

  return labels[status] ?? status;
}

function authStatusValue(user: UserRow | null | undefined) {
  const value = user?.auth_status;

  return value === "invited" || value === "active" || value === "disabled" ? value : "profile_only";
}

function authAccessLabel(user: UserRow | null | undefined) {
  const labels: Record<string, string> = {
    active: "доступ активен",
    disabled: "доступ отключен",
    invited: "приглашение отправлено",
    profile_only: "без входа",
  };

  return labels[authStatusValue(user)];
}

function authAccessDetail(user: UserRow | null | undefined, email: string | null | undefined) {
  const status = authStatusValue(user);
  const emailLabel = email?.trim() || user?.email || "email не заполнен";

  if (status === "active") {
    return user?.last_sign_in_at ? `последний вход ${formatDateTime(user.last_sign_in_at)}` : `аккаунт связан: ${emailLabel}`;
  }

  if (status === "invited") {
    return user?.invited_at ? `отправлено ${formatDateTime(user.invited_at)}` : `ожидает входа: ${emailLabel}`;
  }

  if (status === "disabled") {
    return "учебная история сохранена";
  }

  return emailLabel === "email не заполнен" ? "для приглашения нужен email" : `можно пригласить: ${emailLabel}`;
}

function authAccessAction(user: UserRow | null | undefined, email: string | null | undefined) {
  const status = authStatusValue(user);

  if (!email?.trim()) {
    return null;
  }

  if (status === "profile_only") {
    return "invite";
  }

  if (status === "invited") {
    return "resend";
  }

  if (status === "active") {
    return "disable";
  }

  return null;
}

function groupStatusLabel(status: string) {
  const labels: Record<string, string> = {
    active: "активна",
    archived: "архив",
    completed: "завершена",
    paused: "пауза",
    recruiting: "набор",
  };

  return labels[status] ?? statusLabel(status);
}

function formatLabel(value: string) {
  const labels: Record<string, string> = {
    both: "группы и индивидуально",
    group: "группы",
    individual: "индивидуально",
    tajweed: "таджвид",
  };

  return labels[value] ?? value;
}

function weekdayLabel(value: number) {
  const labels: Record<number, string> = {
    0: "воскресенье",
    1: "понедельник",
    2: "вторник",
    3: "среда",
    4: "четверг",
    5: "пятница",
    6: "суббота",
  };

  return labels[value] ?? `день ${value}`;
}

function weekdayOrderValue(value: number) {
  return value === 0 ? 7 : value;
}

function currentMoscowMonthValue() {
  const parts = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    timeZone: "Europe/Moscow",
    year: "numeric",
  }).formatToParts(new Date());
  const values = new Map(parts.map((part) => [part.type, part.value]));

  return `${values.get("year")}-${values.get("month")}`;
}

function normalizeMonthValue(value: string | null | undefined) {
  return value && /^\d{4}-\d{2}$/.test(value) ? value : currentMoscowMonthValue();
}

function addMonthValue(monthValue: string, delta: number) {
  const [year, month] = monthValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${date.getUTCFullYear()}-${nextMonth}`;
}

function monthBoundaryIso(monthValue: string) {
  return new Date(`${monthValue}-01T00:00:00+03:00`).toISOString();
}

function journalKey(lessonId: string, studentId: string) {
  return `${lessonId}:${studentId}`;
}

function normalizeAttendanceMark(value: string | null): TeacherJournalCell["attendanceMark"] {
  if (value === "present" || value === "absent" || value === "excused") {
    return value;
  }

  return "";
}

function manualJournalMarkValue(entry: JournalEntryRow | undefined) {
  const attendanceMark = normalizeAttendanceMark(entry?.attendance_mark ?? null);

  if (attendanceMark === "present") {
    return "П";
  }

  if (attendanceMark === "absent") {
    return "Н";
  }

  if (attendanceMark === "excused") {
    return "У";
  }

  return entry?.lesson_mark ?? "";
}

function attendanceTone(
  attendanceMark: TeacherJournalCell["attendanceMark"],
  isFuture: boolean,
  hasSavedEntry: boolean,
): TeacherJournalCell["attendanceTone"] {
  if (attendanceMark === "absent") {
    return "danger";
  }

  if (attendanceMark === "excused") {
    return "warning";
  }

  if (attendanceMark === "present" || (!isFuture && hasSavedEntry)) {
    return "ok";
  }

  return "neutral";
}

function studentAttendanceStatus(
  lesson: LessonRow,
  entry: JournalEntryRow | undefined,
): { label: string; status: StudentAttendanceStatus } {
  const mark = normalizeAttendanceMark(entry?.attendance_mark ?? null);
  const isFuture = new Date(lesson.starts_at).getTime() > Date.now();

  if (mark === "absent") {
    return { label: "отсутствовал", status: "absent" };
  }

  if (mark === "excused") {
    return { label: "уважительная причина", status: "excused" };
  }

  if (mark === "present" || (!isFuture && Boolean(entry))) {
    return { label: "присутствовал", status: "present" };
  }

  return { label: "не отмечено", status: "unknown" };
}

function lessonMarkOptions(scale: string | null | undefined): SelectOption[] {
  if (scale === "five_point") {
    return [1, 2, 3, 4, 5].map((value) => ({ label: String(value), value: String(value) }));
  }

  if (scale === "ten_point") {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => ({
      label: String(value),
      value: String(value),
    }));
  }

  return [];
}

function lessonMarkScaleLabel(scale: string | null | undefined) {
  if (scale === "five_point") {
    return "5-балльная шкала";
  }

  if (scale === "ten_point") {
    return "10-балльная шкала";
  }

  return "оценка за урок не используется";
}

function materialTypeLabel(value: string) {
  const labels: Record<string, string> = {
    link: "ссылка",
    text: "текст",
  };

  return labels[value] ?? value;
}

function materialVisibilityLabel(value: string) {
  const labels: Record<string, string> = {
    teacher_only: "только преподавателю",
    visible_to_students: "видно ученикам",
  };

  return labels[value] ?? value;
}

function homeworkStatusLabel(value: string) {
  const labels: Record<string, string> = {
    active: "активно",
    archived: "архив",
    cancelled: "отменено",
  };

  return labels[value] ?? value;
}

function materialStatusLabel(value: string) {
  const labels: Record<string, string> = {
    active: "активен",
    archived: "архив",
    hidden: "скрыт",
  };

  return labels[value] ?? value;
}

function progressLevelLabel(value: string | null | undefined) {
  const labels: Record<string, string> = {
    excellent: "отлично",
    good: "хорошо",
    poor: "плохо",
    satisfactory: "удовлетворительно",
  };

  return value ? labels[value] ?? value : "без уровня";
}

function isMoscowMonday(value: string) {
  return (
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Moscow",
      weekday: "short",
    }).format(new Date(value)) === "Mon"
  );
}

function isPaymentAttention(payment: PaymentRow) {
  if (payment.status === "overdue") {
    return true;
  }

  if (payment.status !== "pending" || !payment.due_at) {
    return false;
  }

  return new Date(payment.due_at).getTime() < Date.now();
}

function describePaymentStatus(payment: PaymentRow) {
  if (isPaymentAttention(payment) && payment.status === "pending") {
    return "ожидает, срок прошел";
  }

  return statusLabel(payment.status);
}

function paymentPeriodTypeLabel(value: string | null | undefined) {
  const labels: Record<string, string> = {
    course: "Курс",
    lesson: "Занятие",
    manual: "Произвольный период",
    month: "Месяц",
  };

  return value ? labels[value] ?? value : "Период";
}

function formatPaymentPeriod(payment: PaymentRow) {
  const label = paymentPeriodTypeLabel(payment.period_type);

  if (payment.period_start && payment.period_end) {
    return `${label}: ${formatDate(payment.period_start)} - ${formatDate(payment.period_end)}`;
  }

  if (payment.period_start) {
    return `${label}: с ${formatDate(payment.period_start)}`;
  }

  if (payment.period_end) {
    return `${label}: до ${formatDate(payment.period_end)}`;
  }

  return label;
}

function paymentStatusTone(payment: PaymentRow): PaymentDetailItem["statusTone"] {
  if (payment.status === "paid" || payment.status === "exempt") {
    return "ok";
  }

  if (isPaymentAttention(payment)) {
    return "danger";
  }

  if (payment.status === "pending") {
    return "warning";
  }

  return "neutral";
}

function paymentContext(
  payment: PaymentRow,
  courses: Map<string, CourseRow>,
  groups: Map<string, GroupRow>,
) {
  const group = payment.group_id ? groups.get(payment.group_id) : null;

  if (group) {
    return `${group.name} - ${courses.get(group.course_id)?.name ?? "курс"}`;
  }

  if (payment.course_id) {
    return courses.get(payment.course_id)?.name ?? "Курс";
  }

  return "Учебный контекст";
}

function paymentMonthValue(payment: PaymentRow) {
  return (payment.period_start ?? payment.due_at ?? payment.period_end ?? payment.created_at ?? formatMoscowDateValue(new Date())).slice(
    0,
    7,
  );
}

function paymentMatchesFilters(payment: PaymentRow, filters: AdminPaymentFilters) {
  if (filters.studentId && payment.student_id !== filters.studentId) {
    return false;
  }

  if (filters.groupId && payment.group_id !== filters.groupId) {
    return false;
  }

  if (filters.status && payment.status !== filters.status) {
    return false;
  }

  if (filters.period && paymentMonthValue(payment) !== filters.period) {
    return false;
  }

  return true;
}

function paymentPeriodOptions(payments: PaymentRow[]) {
  const months = new Set(payments.map(paymentMonthValue).filter((value) => /^\d{4}-\d{2}$/.test(value)));

  return [...months]
    .sort((left, right) => right.localeCompare(left))
    .map((monthValue) => ({ label: formatMonthLabel(monthValue), value: monthValue }));
}

function sumPaymentAmount(payments: PaymentRow[]) {
  return payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
}

function paymentDetails(
  payments: PaymentRow[],
  students: Map<string, StudentRow>,
  courses: Map<string, CourseRow>,
  groups: Map<string, GroupRow>,
  includeInternalComment: boolean,
) {
  return payments.map((payment) => ({
    amount: formatMoney(payment.amount, payment.currency),
    amountValue: String(payment.amount),
    attention: isPaymentAttention(payment),
    comment: payment.comment ?? "",
    context: paymentContext(payment, courses, groups),
    contextHref: payment.group_id
      ? `/admin/groups/${payment.group_id}`
      : payment.course_id
        ? `/admin/courses/${payment.course_id}`
        : "",
    currency: payment.currency,
    due: formatDate(payment.due_at),
    dueAt: payment.due_at ?? "",
    groupId: payment.group_id ?? "",
    id: payment.id,
    internalComment: includeInternalComment ? payment.internal_comment ?? "" : "",
    period: formatPaymentPeriod(payment),
    periodEnd: payment.period_end ?? "",
    periodStart: payment.period_start ?? "",
    periodTypeValue: payment.period_type ?? "month",
    status: describePaymentStatus(payment),
    statusTone: paymentStatusTone(payment),
    statusValue: payment.status,
    studentId: payment.student_id,
    studentName: students.get(payment.student_id)?.name ?? "Ученик",
  }));
}

async function getOrganization(client: SupabaseClient, organizationId: string) {
  const result = await client
    .from("organizations")
    .select("id,name,timezone")
    .eq("id", organizationId)
    .maybeSingle();

  return single<OrganizationRow>(result, "Организация");
}

async function getUserByEmail(client: SupabaseClient, email: string) {
  const result = await client
    .from("users")
    .select("id,name,email,phone,status,auth_user_id,auth_status,invited_at,last_sign_in_at")
    .eq("email", email)
    .maybeSingle();

  return single<UserRow>(result, `Пользователь ${email}`);
}

function summarizeLessons(lessons: LessonRow[], courses: Map<string, CourseRow>, groups: Map<string, GroupRow>) {
  return lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.topic || courses.get(lesson.course_id)?.name || "Занятие",
    subtitle: lesson.group_id ? groups.get(lesson.group_id)?.name ?? "Группа" : "Индивидуально",
    when: formatDateTime(lesson.starts_at),
  }));
}

function summarizeStudentLessons(
  lessons: LessonRow[],
  courses: Map<string, CourseRow>,
  groups: Map<string, GroupRow>,
  users: Map<string, UserRow>,
) {
  return lessons.map((lesson) => {
    const course = courses.get(lesson.course_id);
    const group = lesson.group_id ? groups.get(lesson.group_id) : null;

    return {
      course: course?.name ?? "Курс",
      date: formatDateLong(lesson.starts_at),
      group: group?.name ?? "Группа",
      id: lesson.id,
      startsAt: lesson.starts_at,
      status: new Date(lesson.starts_at).getTime() >= Date.now() ? "предстоит" : "прошел",
      teacher: users.get(lesson.teacher_id)?.name ?? "Преподаватель",
      timeRange: `${formatTimeOfDate(lesson.starts_at)}-${formatTimeOfDate(lesson.ends_at)}`,
      title: lesson.topic || course?.name || "Занятие",
    };
  });
}

function studentScheduleKey(groupId: string | null, startsAt: string) {
  return `${groupId ?? "individual"}:${formatMoscowDateValue(startsAt)}:${formatTimeOfDate(startsAt)}`;
}

function isScheduleRuleActiveOnDate(rule: ScheduleRuleRow, dateValue: string) {
  if (compareDateValues(dateValue, rule.starts_on) < 0) {
    return false;
  }

  if (rule.ends_on && compareDateValues(dateValue, rule.ends_on) > 0) {
    return false;
  }

  return weekdayOfDateValue(dateValue) === rule.weekday;
}

function summarizeScheduleRuleLessons(
  scheduleRules: ScheduleRuleRow[],
  courses: Map<string, CourseRow>,
  groups: Map<string, GroupRow>,
  users: Map<string, UserRow>,
  existingLessonKeys: Set<string>,
  limit: number,
) {
  const today = formatMoscowDateValue(new Date());
  const items: StudentScheduleLesson[] = [];
  let dateValue = today;

  for (let daysAhead = 0; daysAhead < 180 && items.length < limit; daysAhead += 1) {
    for (const rule of scheduleRules) {
      if (!isScheduleRuleActiveOnDate(rule, dateValue)) {
        continue;
      }

      const group = groups.get(rule.target_id);

      if (!group) {
        continue;
      }

      const startsAt = moscowDateTimeIso(dateValue, rule.start_time);

      if (new Date(startsAt).getTime() < Date.now()) {
        continue;
      }

      const key = studentScheduleKey(group.id, startsAt);

      if (existingLessonKeys.has(key)) {
        continue;
      }

      const endsAt = moscowDateTimeIso(dateValue, rule.end_time);
      const course = courses.get(group.course_id);

      items.push({
        course: course?.name ?? "Курс",
        date: formatDateLong(startsAt),
        group: group.name,
        id: `rule-${rule.id}-${dateValue}`,
        startsAt,
        status: "по расписанию",
        teacher: group.teacher_id ? users.get(group.teacher_id)?.name ?? "Преподаватель" : "Преподаватель",
        timeRange: `${formatTimeOfDate(startsAt)}-${formatTimeOfDate(endsAt)}`,
        title: course?.name ?? "Занятие",
      });
    }

    dateValue = addDaysToDateValue(dateValue, 1);
  }

  return items;
}

function summarizeStudentScheduleLessons(
  lessons: LessonRow[],
  scheduleRules: ScheduleRuleRow[],
  courses: Map<string, CourseRow>,
  groups: Map<string, GroupRow>,
  users: Map<string, UserRow>,
  limit: number,
) {
  const materializedLessons = summarizeStudentLessons(lessons, courses, groups, users);
  const existingLessonKeys = new Set(lessons.map((lesson) => studentScheduleKey(lesson.group_id, lesson.starts_at)));
  const plannedLessons = summarizeScheduleRuleLessons(scheduleRules, courses, groups, users, existingLessonKeys, limit);

  return [...materializedLessons, ...plannedLessons]
    .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
    .slice(0, limit);
}

function summarizePayments(
  payments: PaymentRow[],
  students: Map<string, StudentRow>,
  courses: Map<string, CourseRow>,
  groups: Map<string, GroupRow>,
) {
  return payments.map((payment) => ({
    id: payment.id,
    studentName: students.get(payment.student_id)?.name ?? "Ученик",
    context:
      groups.get(payment.group_id ?? "")?.name ??
      courses.get(payment.course_id ?? "")?.name ??
      "Учебный контекст",
    amount: formatMoney(payment.amount, payment.currency),
    amountValue: String(payment.amount),
    comment: payment.comment ?? "",
    currency: payment.currency,
    due: formatDate(payment.due_at),
    dueAt: payment.due_at ?? "",
    internalComment: payment.internal_comment ?? "",
    periodEnd: payment.period_end ?? "",
    periodStart: payment.period_start ?? "",
    periodTypeValue: payment.period_type ?? "month",
    status: describePaymentStatus(payment),
  }));
}

function summarizeScheduleRules(scheduleRules: ScheduleRuleRow[]) {
  return scheduleRules
    .slice()
    .sort(
      (left, right) =>
        weekdayOrderValue(left.weekday) - weekdayOrderValue(right.weekday) ||
        left.start_time.localeCompare(right.start_time),
    )
    .map((rule) => ({
      id: rule.id,
      weekday: weekdayLabel(rule.weekday),
      timeRange: `${formatTime(rule.start_time)}-${formatTime(rule.end_time)}`,
      period: `с ${formatDate(rule.starts_on)} ${rule.ends_on ? `до ${formatDate(rule.ends_on)}` : "без окончания"}`,
    }));
}

function activeWorkspaceGroups(groups: GroupRow[], memberships: GroupStudentRow[]) {
  const activeGroupIds = new Set(memberships.filter((item) => item.status === "active").map((item) => item.group_id));

  return groups.filter((group) => activeGroupIds.has(group.id) && group.status !== "archived");
}

async function getBaseOrganizationData(client: SupabaseClient, organizationId: string) {
  const [organizationResult, coursesResult, groupsResult, studentsResult, membersResult] =
    await Promise.all([
      client.from("organizations").select("id,name,timezone").eq("id", organizationId).maybeSingle(),
      client
        .from("courses")
        .select("id,name,description,type,format,lesson_mark_scale,status")
        .eq("organization_id", organizationId),
      client.from("groups").select("id,course_id,teacher_id,name,status").eq("organization_id", organizationId),
      client.from("students").select("id,user_id,name,phone,email,status").eq("organization_id", organizationId),
      client.from("organization_members").select("id,user_id,roles,permissions").eq("organization_id", organizationId),
    ]);

  const students = rows<StudentRow>(studentsResult, "Ученики");
  const members = rows<MemberRow>(membersResult, "Роли");
  const userIds = Array.from(
    new Set([
      ...members.map((member) => member.user_id),
      ...students.map((student) => student.user_id).filter((userId): userId is string => Boolean(userId)),
    ]),
  );
  const users =
    userIds.length > 0
      ? rows<UserRow>(
          await client
            .from("users")
            .select("id,name,email,phone,status,auth_user_id,auth_status,invited_at,last_sign_in_at")
            .in("id", userIds),
          "Пользователи",
        )
      : [];

  return {
    organization: single<OrganizationRow>(organizationResult, "Организация"),
    courses: rows<CourseRow>(coursesResult, "Курсы"),
    groups: rows<GroupRow>(groupsResult, "Группы"),
    students,
    users,
    members,
  };
}

export async function getAdminOverview(organizationId: string) {
  return readSupabaseData<AdminOverviewData>(async (client) => {
    const now = new Date().toISOString();
    const [organizationResult, coursesResult, groupsResult, studentsResult, membersResult, lessonsResult, paymentsResult] =
      await Promise.all([
        client.from("organizations").select("id,name,timezone").eq("id", organizationId).maybeSingle(),
        client
          .from("courses")
          .select("id,name,description,type,format,lesson_mark_scale,status")
          .eq("organization_id", organizationId),
        client.from("groups").select("id,course_id,teacher_id,name,status").eq("organization_id", organizationId),
        client.from("students").select("id,user_id,name,phone,email,status").eq("organization_id", organizationId),
        client.from("organization_members").select("id,user_id,roles,permissions").eq("organization_id", organizationId),
        client
          .from("lessons")
          .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
          .eq("organization_id", organizationId)
          .gte("starts_at", now)
          .order("starts_at", { ascending: true })
          .limit(5),
        client
          .from("payments")
          .select("id,student_id,course_id,group_id,amount,currency,period_start,period_end,due_at,status")
          .eq("organization_id", organizationId),
      ]);
    const organization = single<OrganizationRow>(organizationResult, "Организация");
    const courses = rows<CourseRow>(coursesResult, "Курсы");
    const groups = rows<GroupRow>(groupsResult, "Группы");
    const students = rows<StudentRow>(studentsResult, "Ученики");
    const members = rows<MemberRow>(membersResult, "Роли");
    const lessons = rows<LessonRow>(lessonsResult, "Ближайшие занятия");
    const payments = rows<PaymentRow>(paymentsResult, "Оплата");
    const courseMap = byId(courses);
    const groupMap = byId(groups);
    const studentMap = byId(students);
    const attentionPayments = payments.filter(isPaymentAttention).slice(0, 5);
    const teacherCount = members.filter((member) => member.roles.includes("teacher")).length;

    return {
      organizationName: organization.name,
      metrics: [
        { label: "Курсы", value: String(courses.length), detail: "активная учебная база" },
        { label: "Группы", value: String(groups.length), detail: "в Supabase dev" },
        { label: "Преподаватели", value: String(teacherCount), detail: "по ролям организации" },
        { label: "Ученики", value: String(students.length), detail: "учебные карточки" },
      ],
      upcomingLessons: summarizeLessons(lessons, courseMap, groupMap),
      duePayments: summarizePayments(attentionPayments, studentMap, courseMap, groupMap),
    };
  });
}

export async function getAdminCourses(organizationId: string) {
  return readSupabaseData<{ courses: AdminCourseItem[] }>(async (client) => {
    const [coursesResult, groupsResult] = await Promise.all([
      client
        .from("courses")
        .select("id,name,description,type,format,lesson_mark_scale,status")
        .eq("organization_id", organizationId),
      client.from("groups").select("id,course_id,teacher_id,name,status").eq("organization_id", organizationId),
    ]);
    const courses = rows<CourseRow>(coursesResult, "Курсы");
    const groups = rows<GroupRow>(groupsResult, "Группы");

    return {
      courses: courses.map((course) => ({
        id: course.id,
        name: course.name,
        description: course.description ?? "Описание пока не заполнено",
        format: formatLabel(course.format),
        status: statusLabel(course.status),
        groupCount: String(groups.filter((group) => group.course_id === course.id).length),
      })),
    };
  });
}

export async function getAdminCourseDetail(organizationId: string, courseId: string) {
  return readSupabaseData<AdminCourseDetailData>(async (client) => {
    const { courses, groups, students, users } = await getBaseOrganizationData(client, organizationId);
    const course = courses.find((item) => item.id === courseId);

    if (!course) {
      throw new Error("Курс: запись не найдена.");
    }

    const courseGroups = groups.filter((group) => group.course_id === course.id);
    const courseGroupIds = courseGroups.map((group) => group.id);
    const now = new Date().toISOString();
    const [settingsResult, groupStudentsResult, lessonsResult, materialsResult, paymentsResult] = await Promise.all([
      client
        .from("course_progress_settings")
        .select("id,course_id,name,is_progress_enabled")
        .eq("course_id", course.id)
        .maybeSingle(),
      courseGroupIds.length > 0
        ? client.from("group_students").select("id,group_id,student_id,status,joined_at,left_at").in("group_id", courseGroupIds)
        : Promise.resolve({ data: [], error: null }),
      client
        .from("lessons")
        .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
        .eq("organization_id", organizationId)
        .eq("course_id", course.id)
        .gte("starts_at", now)
        .order("starts_at", { ascending: true })
        .limit(40),
      client
        .from("materials")
        .select("id,course_id,group_id,student_id,lesson_id,homework_id,title,type,content,url,visibility,status")
        .eq("organization_id", organizationId)
        .eq("course_id", course.id)
        .neq("status", "archived")
        .order("created_at", { ascending: false })
        .limit(12),
      client
        .from("payments")
        .select("id,student_id,course_id,group_id,amount,currency,period_start,period_end,due_at,status")
        .eq("organization_id", organizationId)
        .eq("course_id", course.id),
    ]);
    if (settingsResult.error) {
      throw new Error(`Настройки прогресса курса: ${settingsResult.error.message}`);
    }

    const settings = (settingsResult.data as CourseProgressSettingsRow | null) ?? null;
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Состав групп курса");
    const lessons = rows<LessonRow>(lessonsResult, "Занятия курса");
    const materials = rows<MaterialRow>(materialsResult, "Материалы курса");
    const payments = rows<PaymentRow>(paymentsResult, "Оплаты курса");
    const userMap = byId(users);
    const studentMap = byId(students);
    const groupMap = byId(courseGroups);
    const activeMemberships = groupStudents.filter((item) => item.status === "active");
    const activeStudentIds = new Set(activeMemberships.map((item) => item.student_id));
    const courseStudents = students.filter((student) => activeStudentIds.has(student.id));
    const attentionPayments = payments.filter(isPaymentAttention);

    return {
      description: course.description ?? "",
      format: formatLabel(course.format),
      formatValue: course.format,
      groups: courseGroups.map((group) => {
        const nextLesson = lessons.find((lesson) => lesson.group_id === group.id);

        return {
          id: group.id,
          name: group.name,
          nextLesson: nextLesson ? formatDateTime(nextLesson.starts_at) : "нет ближайшего занятия",
          status: groupStatusLabel(group.status),
          students: String(activeMemberships.filter((item) => item.group_id === group.id).length),
          teacher: group.teacher_id ? userMap.get(group.teacher_id)?.name ?? "не назначен" : "не назначен",
        };
      }),
      id: course.id,
      lessonMarkScale: lessonMarkScaleLabel(course.lesson_mark_scale),
      lessonMarkScaleValue: course.lesson_mark_scale ?? "five_point",
      materials: materials.map((item) => ({
        detail: `${materialTypeLabel(item.type)}; ${materialVisibilityLabel(item.visibility)}; ${materialStatusLabel(item.status)}`,
        id: item.id,
        title: item.title,
      })),
      metrics: [
        { label: "Группы", value: String(courseGroups.length) },
        { label: "Ученики", value: String(activeStudentIds.size), detail: "активные связи с группами" },
        { label: "Ближайшие уроки", value: String(lessons.length) },
        { label: "Оплаты", value: String(attentionPayments.length), detail: "требуют внимания" },
      ],
      name: course.name,
      paymentSignals: summarizePayments(attentionPayments.slice(0, 6), studentMap, new Map([[course.id, course]]), groupMap),
      progressSettings: {
        enabled: settings?.is_progress_enabled ? "включен" : "выключен",
        id: settings?.id ?? null,
        name: settings?.name ?? "Прогресс курса не настроен",
      },
      status: statusLabel(course.status),
      statusValue: course.status,
      students: courseStudents.map((student) => {
        const memberships = activeMemberships.filter((item) => item.student_id === student.id);
        const studentPayments = payments.filter((payment) => payment.student_id === student.id);
        const attentionPayment = studentPayments.find(isPaymentAttention) ?? studentPayments[0];

        return {
          contacts: [student.phone, student.email].filter(Boolean).join(", ") || "контакты не заполнены",
          groups: memberships.map((item) => groupMap.get(item.group_id)?.name).filter(Boolean).join(", ") || "без группы",
          id: student.id,
          name: student.name,
          payment: attentionPayment
            ? `${formatMoney(attentionPayment.amount, attentionPayment.currency)} - ${describePaymentStatus(attentionPayment)}`
            : "не настроена",
          status: statusLabel(student.status),
        };
      }),
      type: formatLabel(course.type),
    };
  });
}

export async function getAdminGroups(organizationId: string) {
  return readSupabaseData<AdminGroupsData>(async (client) => {
    const { courses, groups, members, students, users } = await getBaseOrganizationData(client, organizationId);
    const groupIds = groups.map((group) => group.id);
    const [groupStudentsResult, lessonsResult] = await Promise.all([
      groupIds.length > 0
        ? client.from("group_students").select("id,group_id,student_id,status").in("group_id", groupIds)
        : Promise.resolve({ data: [], error: null }),
      groupIds.length > 0
        ? client
            .from("lessons")
            .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
            .in("group_id", groupIds)
            .gte("starts_at", new Date().toISOString())
            .order("starts_at", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
    ]);
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Состав групп");
    const lessons = rows<LessonRow>(lessonsResult, "Занятия групп");
    const courseMap = byId(courses);
    const userMap = byId(users);
    const teacherIds = new Set(
      members
        .filter((member) => member.roles.includes("teacher") && member.user_id)
        .map((member) => member.user_id),
    );

    return {
      groups: groups.map((group) => {
        const nextLesson = lessons.find((lesson) => lesson.group_id === group.id);

        return {
          id: group.id,
          name: group.name,
          course: courseMap.get(group.course_id)?.name ?? "Курс",
          teacher: group.teacher_id ? userMap.get(group.teacher_id)?.name ?? "Не назначен" : "Не назначен",
          status: groupStatusLabel(group.status),
          students: String(groupStudents.filter((item) => item.group_id === group.id && item.status === "active").length),
          nextLesson: nextLesson ? formatDateTime(nextLesson.starts_at) : "нет ближайшего занятия",
        };
      }),
      courseOptions: courses
        .filter((course) => course.status === "active")
        .map((course) => ({ label: course.name, value: course.id })),
      groupOptions: groups
        .filter((group) => group.status === "active" || group.status === "recruiting")
        .map((group) => ({ label: group.name, value: group.id })),
      studentOptions: students
        .filter((student) => student.status === "active")
        .map((student) => ({ label: student.name, value: student.id })),
      teacherOptions: users
        .filter((user) => user.status === "active" && teacherIds.has(user.id))
        .map((user) => ({ label: user.name, value: user.id })),
    };
  });
}

export async function getAdminGroupDetail(organizationId: string, groupId: string) {
  return readSupabaseData<AdminGroupDetailData>(async (client) => {
    const { courses, groups, members, students, users } = await getBaseOrganizationData(client, organizationId);
    const group = groups.find((item) => item.id === groupId);

    if (!group) {
      throw new Error("Группа: запись не найдена.");
    }

    const now = new Date().toISOString();
    const [groupStudentsResult, scheduleRulesResult, lessonsResult] = await Promise.all([
      client.from("group_students").select("id,group_id,student_id,status,joined_at,left_at").eq("group_id", groupId),
      client
        .from("schedule_rules")
        .select("id,target_type,target_id,weekday,start_time,end_time,starts_on,ends_on,status")
        .eq("organization_id", organizationId)
        .eq("target_type", "group")
        .eq("target_id", groupId)
        .eq("status", "active")
        .order("weekday", { ascending: true })
        .order("start_time", { ascending: true }),
      client
        .from("lessons")
        .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
        .eq("organization_id", organizationId)
        .eq("group_id", groupId)
        .gte("starts_at", now)
        .order("starts_at", { ascending: true })
        .limit(5),
    ]);
    const groupStudents = rows<GroupStudentRow & { joined_at: string | null }>(groupStudentsResult, "Состав группы");
    const scheduleRules = rows<ScheduleRuleRow>(scheduleRulesResult, "Расписание группы");
    const lessons = rows<LessonRow>(lessonsResult, "Ближайшие занятия группы");
    const courseMap = byId(courses);
    const studentMap = byId(students);
    const userMap = byId(users);
    const teacherIds = new Set(
      members
        .filter((member) => member.roles.includes("teacher") && member.user_id)
        .map((member) => member.user_id),
    );
    const activeGroupStudents = groupStudents.filter((item) => item.status === "active");
    const activeStudentIds = new Set(activeGroupStudents.map((item) => item.student_id));
    const teacherName = group.teacher_id ? userMap.get(group.teacher_id)?.name ?? "Не назначен" : "Не назначен";
    const problemSignals: ProblemSignal[] = [
      !group.teacher_id
        ? {
            detail: "У группы нет преподавателя.",
            label: "Нет преподавателя",
            tone: "warning",
          }
        : null,
      activeGroupStudents.length === 0
        ? {
            detail: "В активном составе пока нет учеников.",
            label: "Нет учеников",
            tone: "warning",
          }
        : null,
      scheduleRules.length === 0
        ? {
            detail: "Активное расписание для группы не найдено.",
            label: "Нет расписания",
            tone: "warning",
          }
        : null,
      lessons.length === 0
        ? {
            detail: "Ближайшие занятия для группы не созданы.",
            label: "Нет ближайших занятий",
            tone: "warning",
          }
        : null,
    ].filter((item): item is ProblemSignal => item !== null);

    return {
      id: group.id,
      name: group.name,
      course: courseMap.get(group.course_id)?.name ?? "Курс",
      teacher: teacherName,
      teacherId: group.teacher_id,
      status: groupStatusLabel(group.status),
      statusValue: group.status,
      problemSignals,
      students: activeGroupStudents.map((item) => {
        const student = studentMap.get(item.student_id);

        return {
          id: item.student_id,
          groupStudentId: item.id,
          name: student?.name ?? "Ученик",
          contacts: [student?.phone, student?.email].filter(Boolean).join(", ") || "контакты не заполнены",
          joinedAt: formatDate(item.joined_at),
          status: statusLabel(item.status),
        };
      }),
      scheduleRules: summarizeScheduleRules(scheduleRules),
      upcomingLessons: summarizeLessons(lessons, courseMap, new Map([[group.id, group]])),
      studentOptions: students
        .filter((student) => student.status === "active" && !activeStudentIds.has(student.id))
        .map((student) => ({ label: student.name, value: student.id })),
      teacherOptions: users
        .filter((user) => user.status === "active" && teacherIds.has(user.id))
        .map((user) => ({ label: user.name, value: user.id })),
    };
  });
}

export async function getAdminStudents(organizationId: string) {
  return readSupabaseData<{ students: AdminStudentItem[] }>(async (client) => {
    const { courses, groups, students, users } = await getBaseOrganizationData(client, organizationId);
    const studentIds = students.map((student) => student.id);
    const [groupStudentsResult, paymentsResult] = await Promise.all([
      studentIds.length > 0
        ? client.from("group_students").select("id,group_id,student_id,status").in("student_id", studentIds)
        : Promise.resolve({ data: [], error: null }),
      studentIds.length > 0
        ? client
            .from("payments")
            .select("id,student_id,course_id,group_id,amount,currency,period_start,period_end,due_at,status")
            .in("student_id", studentIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Группы учеников");
    const payments = rows<PaymentRow>(paymentsResult, "Оплата учеников");
    const courseMap = byId(courses);
    const groupMap = byId(groups);
    const userMap = byId(users);

    return {
      students: students.map((student) => {
        const user = student.user_id ? userMap.get(student.user_id) : null;
        const studentGroupIds = groupStudents
          .filter((item) => item.student_id === student.id && item.status === "active")
          .map((item) => item.group_id);
        const studentPayments = payments.filter((payment) => payment.student_id === student.id);
        const attentionPayment = studentPayments.find(isPaymentAttention) ?? studentPayments[0];

        return {
          access: authAccessLabel(user),
          id: student.id,
          name: student.name,
          contacts: [student.phone, student.email].filter(Boolean).join(", ") || "контакты не заполнены",
          status: statusLabel(student.status),
          groups:
            studentGroupIds.map((groupId) => groupMap.get(groupId)?.name).filter(Boolean).join(", ") ||
            courseMap.get(attentionPayment?.course_id ?? "")?.name ||
            "не назначен",
          payment: attentionPayment
            ? `${formatMoney(attentionPayment.amount, attentionPayment.currency)} - ${describePaymentStatus(attentionPayment)}`
            : "не настроена",
        };
      }),
    };
  });
}

export async function getAdminStudentDetail(organizationId: string, studentId: string) {
  return readSupabaseData<AdminStudentDetailData>(async (client) => {
    const { courses, groups, students, users } = await getBaseOrganizationData(client, organizationId);
    const student = students.find((item) => item.id === studentId);

    if (!student) {
      throw new Error("Ученик: запись не найдена.");
    }

    const groupStudentsResult = await client
      .from("group_students")
      .select("id,group_id,student_id,status,joined_at,left_at")
      .eq("student_id", student.id);
    const memberships = rows<GroupStudentRow>(groupStudentsResult, "Группы ученика");
    const activeGroupIds = new Set(activeWorkspaceGroups(groups, memberships).map((group) => group.id));
    const groupIdList = [...new Set(memberships.map((item) => item.group_id))];
    const visibleGroups = groups.filter((group) => groupIdList.includes(group.id));
    const courseIds = new Set(visibleGroups.map((group) => group.course_id));
    const courseIdList = [...courseIds];
    const [lessonsResult, entriesResult, rulesResult, errorsResult, recordsResult, homeworkResult, materialsResult, paymentsResult] =
      await Promise.all([
        groupIdList.length > 0
          ? client
              .from("lessons")
              .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
              .eq("organization_id", organizationId)
              .in("group_id", groupIdList)
              .order("starts_at", { ascending: false })
              .limit(24)
          : Promise.resolve({ data: [], error: null }),
        client
          .from("journal_entries")
          .select("id,lesson_id,student_id,attendance_mark,lesson_mark,teacher_comment,internal_comment,is_visible_to_student")
          .eq("student_id", student.id),
        courseIdList.length > 0
          ? client
              .from("student_progress_rules")
              .select("id,student_id,course_id,name,level,note,is_visible_to_student,is_active")
              .eq("organization_id", organizationId)
              .eq("student_id", student.id)
              .in("course_id", courseIdList)
              .order("sort_order", { ascending: true })
              .order("created_at", { ascending: true })
          : Promise.resolve({ data: [], error: null }),
        courseIdList.length > 0
          ? client
              .from("student_progress_errors")
              .select("id,student_id,course_id,name,note,is_visible_to_student,is_active")
              .eq("organization_id", organizationId)
              .eq("student_id", student.id)
              .in("course_id", courseIdList)
              .order("created_at", { ascending: true })
          : Promise.resolve({ data: [], error: null }),
        courseIdList.length > 0
          ? client
              .from("progress_records")
              .select("id,student_id,course_id,lesson_id,repeat_note,student_comment,internal_comment,is_visible_to_student,created_at")
              .eq("organization_id", organizationId)
              .eq("student_id", student.id)
              .in("course_id", courseIdList)
              .order("created_at", { ascending: false })
              .limit(12)
          : Promise.resolve({ data: [], error: null }),
        client
          .from("homework")
          .select("id,course_id,group_id,student_id,lesson_id,title,description,due_at,status")
          .eq("organization_id", organizationId)
          .neq("status", "archived")
          .order("due_at", { ascending: true, nullsFirst: false })
          .limit(80),
        client
          .from("materials")
          .select("id,course_id,group_id,student_id,lesson_id,homework_id,title,type,content,url,visibility,status")
          .eq("organization_id", organizationId)
          .neq("status", "archived")
          .order("created_at", { ascending: false })
          .limit(120),
        client
          .from("payments")
          .select(paymentSelectFields)
          .eq("organization_id", organizationId)
          .eq("student_id", student.id),
      ]);
    const lessons = rows<LessonRow>(lessonsResult, "Учебная история ученика");
    const entries = rows<JournalEntryRow>(entriesResult, "Журнал ученика");
    const rules = rows<ProgressRuleRow>(rulesResult, "Правила прогресса ученика");
    const errors = rows<ProgressErrorRow>(errorsResult, "Ошибки прогресса ученика");
    const records = rows<ProgressRecordRow>(recordsResult, "Записи прогресса ученика");
    const homework = rows<HomeworkRow>(homeworkResult, "Домашние задания ученика").filter(
      (item) => item.student_id === student.id || (item.group_id ? activeGroupIds.has(item.group_id) : false),
    );
    const materials = rows<MaterialRow>(materialsResult, "Материалы ученика").filter(
      (item) =>
        item.student_id === student.id ||
        (item.group_id ? activeGroupIds.has(item.group_id) : false) ||
        (item.course_id ? courseIds.has(item.course_id) && !item.group_id && !item.student_id : false),
    );
    const payments = rows<PaymentRow>(paymentsResult, "Оплаты ученика");
    const courseMap = byId(courses);
    const groupMap = byId(groups);
    const userMap = byId(users);
    const studentUser = student.user_id ? userMap.get(student.user_id) : null;
    const lessonMap = byId(lessons);
    const entryMap = new Map(entries.map((entry) => [entry.lesson_id, entry]));
    const availableGroupOptions = groups
      .filter((group) => {
        const activeMembership = memberships.find((item) => item.group_id === group.id && item.status === "active");
        return !activeMembership && (group.status === "active" || group.status === "recruiting");
      })
      .map((group) => ({
        label: `${group.name} - ${courseMap.get(group.course_id)?.name ?? "курс"}`,
        value: group.id,
      }));
    const absentCount = entries.filter((entry) => entry.attendance_mark === "absent").length;

    return {
      accessAction: authAccessAction(studentUser, student.email),
      accessDetail: authAccessDetail(studentUser, student.email),
      accessStatus: authAccessLabel(studentUser),
      accessStatusValue: authStatusValue(studentUser),
      contacts: [student.phone, student.email].filter(Boolean).join(", ") || "контакты не заполнены",
      email: student.email ?? "",
      errors: errors.map((item) => ({
        course: courseMap.get(item.course_id)?.name ?? "Курс",
        courseId: item.course_id,
        id: item.id,
        isActive: item.is_active,
        isVisibleToStudent: item.is_visible_to_student,
        name: item.name,
        note: item.note ?? "",
      })),
      groupOptions: availableGroupOptions,
      groups: memberships.map((membership) => {
        const group = groupMap.get(membership.group_id);

        return {
          course: courseMap.get(group?.course_id ?? "")?.name ?? "курс",
          groupId: membership.group_id,
          groupStudentId: membership.id,
          joinedAt: formatDate(membership.joined_at),
          leftAt: formatDate(membership.left_at),
          name: group?.name ?? "Группа",
          status: statusLabel(membership.status),
          statusValue: membership.status,
          teacher: group?.teacher_id ? userMap.get(group.teacher_id)?.name ?? "преподаватель" : "не назначен",
        };
      }),
      homework: homework.slice(0, 6).map((item) => ({
        description: item.description ?? "Описание не заполнено",
        due: formatDate(item.due_at),
        id: item.id,
        title: item.title,
      })),
      id: student.id,
      lessons: lessons.slice(0, 10).map((lesson) => {
        const entry = entryMap.get(lesson.id);
        const attendance = studentAttendanceStatus(lesson, entry);
        const group = lesson.group_id ? groupMap.get(lesson.group_id) : null;

        return {
          attendance: attendance.label,
          comment: entry?.teacher_comment ?? entry?.internal_comment ?? "",
          context: group ? `${group.name} - ${courseMap.get(group.course_id)?.name ?? "курс"}` : courseMap.get(lesson.course_id)?.name ?? "курс",
          id: lesson.id,
          lesson: lesson.topic ?? courseMap.get(lesson.course_id)?.name ?? "Урок",
          when: formatDateTime(lesson.starts_at),
        };
      }),
      materials: materials.slice(0, 6).map((item) => ({
        detail: `${materialTypeLabel(item.type)}; ${materialVisibilityLabel(item.visibility)}; ${materialStatusLabel(item.status)}`,
        id: item.id,
        title: item.title,
      })),
      metrics: [
        { label: "Активные группы", value: String(activeGroupIds.size) },
        { label: "Уроки", value: String(lessons.length), detail: "в учебной истории" },
        { label: "Пропуски", value: String(absentCount) },
        { label: "Оплаты", value: String(payments.filter(isPaymentAttention).length), detail: "требуют внимания" },
      ],
      name: student.name,
      payments: paymentDetails(payments, new Map([[student.id, student]]), courseMap, groupMap, true),
      phone: student.phone ?? "",
      records: records.map((item) => {
        const lesson = item.lesson_id ? lessonMap.get(item.lesson_id) : null;

        return {
          course: courseMap.get(item.course_id)?.name ?? "Курс",
          courseId: item.course_id,
          createdAt: formatDateTime(item.created_at),
          id: item.id,
          internalComment: item.internal_comment ?? "",
          isVisibleToStudent: item.is_visible_to_student,
          lesson: lesson
            ? `${formatDateTime(lesson.starts_at)} - ${lesson.topic ?? courseMap.get(lesson.course_id)?.name ?? "урок"}`
            : "без связи с уроком",
          lessonId: item.lesson_id,
          repeatNote: item.repeat_note ?? "",
          studentComment: item.student_comment ?? "",
        };
      }),
      rules: rules.map((item) => ({
        course: courseMap.get(item.course_id)?.name ?? "Курс",
        courseId: item.course_id,
        id: item.id,
        isActive: item.is_active,
        isVisibleToStudent: item.is_visible_to_student,
        level: progressLevelLabel(item.level),
        levelValue: item.level ?? "",
        name: item.name,
        note: item.note ?? "",
      })),
      status: statusLabel(student.status),
      statusValue: student.status,
    };
  });
}

export async function getAdminTeachers(organizationId: string) {
  return readSupabaseData<AdminTeachersData>(async (client) => {
    const { groups, members, students, users } = await getBaseOrganizationData(client, organizationId);
    const teacherIds = new Set(members.filter((member) => member.roles.includes("teacher")).map((member) => member.user_id));
    const teachers = users.filter((user) => teacherIds.has(user.id));
    const teacherGroupIds = groups.filter((group) => group.teacher_id && teacherIds.has(group.teacher_id)).map((group) => group.id);
    const [groupStudentsResult, lessonsResult] = await Promise.all([
      teacherGroupIds.length > 0
        ? client.from("group_students").select("id,group_id,student_id,status").in("group_id", teacherGroupIds)
        : Promise.resolve({ data: [], error: null }),
      teacherGroupIds.length > 0
        ? client
            .from("lessons")
            .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
            .eq("organization_id", organizationId)
            .in("group_id", teacherGroupIds)
            .gte("starts_at", new Date().toISOString())
        : Promise.resolve({ data: [], error: null }),
    ]);
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Ученики преподавателей");
    const lessons = rows<LessonRow>(lessonsResult, "Занятия преподавателей");

    return {
      metrics: [
        { label: "Преподаватели", value: String(teachers.length) },
        { label: "Активные", value: String(teachers.filter((teacher) => teacher.status === "active").length) },
        { label: "Группы", value: String(groups.filter((group) => group.teacher_id && teacherIds.has(group.teacher_id)).length) },
        { label: "Ученики", value: String(new Set(groupStudents.filter((item) => item.status === "active").map((item) => item.student_id)).size) },
      ],
      teachers: teachers.map((teacher) => {
        const teacherGroups = groups.filter((group) => group.teacher_id === teacher.id);
        const teacherGroupIdSet = new Set(teacherGroups.map((group) => group.id));
        const activeGroupCount = teacherGroups.filter((group) => group.status === "active").length;
        const activeStudentIds = new Set(
          groupStudents
            .filter((item) => item.status === "active" && teacherGroupIdSet.has(item.group_id))
            .map((item) => item.student_id)
            .filter((studentId) => students.some((student) => student.id === studentId)),
        );

        return {
          activeGroups: String(activeGroupCount),
          access: authAccessLabel(teacher),
          accessAction: authAccessAction(teacher, teacher.email),
          accessDetail: authAccessDetail(teacher, teacher.email),
          contacts: [teacher.phone, teacher.email].filter(Boolean).join(", ") || "контакты не заполнены",
          groups: String(teacherGroups.length),
          id: teacher.id,
          name: teacher.name,
          status: statusLabel(teacher.status),
          students: String(activeStudentIds.size),
          upcomingLessons: String(lessons.filter((lesson) => lesson.teacher_id === teacher.id).length),
        };
      }),
    };
  });
}

const paymentSelectFields =
  "id,organization_id,student_id,course_id,group_id,individual_enrollment_id,amount,currency,period_type,period_start,period_end,due_at,status,comment,internal_comment,created_at,updated_at";

export async function getAdminPayments(organizationId: string, filters: AdminPaymentFilters) {
  return readSupabaseData<AdminPaymentsData>(async (client) => {
    const { courses, groups, students } = await getBaseOrganizationData(client, organizationId);
    const activeGroups = groups.filter((group) => group.status === "active" || group.status === "recruiting");
    const activeStudents = students.filter((student) => student.status === "active");
    const activeGroupIds = activeGroups.map((group) => group.id);
    const [paymentsResult, groupStudentsResult] = await Promise.all([
      client
        .from("payments")
        .select(paymentSelectFields)
        .eq("organization_id", organizationId)
        .order("due_at", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false }),
      activeGroupIds.length > 0
        ? client.from("group_students").select("id,group_id,student_id,status").in("group_id", activeGroupIds).eq("status", "active")
        : Promise.resolve({ data: [], error: null }),
    ]);
    const payments = rows<PaymentRow>(paymentsResult, "Оплаты");
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Ученики групп для оплаты");
    const activeFilters = {
      groupId: filters.groupId ?? "",
      period: filters.period ?? "",
      status: filters.status ?? "",
      studentId: filters.studentId ?? "",
    };
    const filteredPayments = payments.filter((payment) => paymentMatchesFilters(payment, activeFilters));
    const courseMap = byId(courses);
    const groupMap = byId(groups);
    const studentMap = byId(students);
    const currentMonth = currentMoscowMonthValue();
    const nextMonth = addMonthValue(currentMonth, 1);
    const filterCount = Object.values(activeFilters).filter(Boolean).length;
    const attentionPayments = filteredPayments.filter(isPaymentAttention);
    const paidPayments = filteredPayments.filter((payment) => payment.status === "paid");
    const pendingPayments = filteredPayments.filter((payment) => payment.status === "pending" || payment.status === "overdue");

    return {
      activeFilters,
      courseOptions: courses
        .filter((course) => course.status === "active")
        .map((course) => ({ label: course.name, value: course.id })),
      defaultDueAt: formatMoscowDateValue(new Date()),
      defaultPeriodEnd: addDaysToDateValue(`${nextMonth}-01`, -1),
      defaultPeriodStart: `${currentMonth}-01`,
      groupOptions: activeGroups.map((group) => ({
          label: `${group.name} - ${courseMap.get(group.course_id)?.name ?? "курс"}`,
          value: group.id,
        })),
      groupStudentOptions: groupStudents
        .filter((membership) => activeStudents.some((student) => student.id === membership.student_id))
        .map((membership) => ({
          groupId: membership.group_id,
          label: studentMap.get(membership.student_id)?.name ?? "Ученик",
          value: membership.student_id,
        })),
      metrics: [
        {
          label: "Оплаты",
          value: String(filteredPayments.length),
          detail: filterCount > 0 ? "в текущей выборке" : "всего в организации",
        },
        { label: "К вниманию", value: String(attentionPayments.length), detail: "просрочено или срок прошел" },
        { label: "Оплачено", value: formatMoney(sumPaymentAmount(paidPayments), "RUB"), detail: "по выбранным оплатам" },
        { label: "Ожидает", value: formatMoney(sumPaymentAmount(pendingPayments), "RUB"), detail: "pending и overdue" },
      ],
      payments: paymentDetails(filteredPayments, studentMap, courseMap, groupMap, true),
      periodOptions: paymentPeriodOptions(payments),
      studentOptions: activeStudents.map((student) => ({ label: student.name, value: student.id })),
    };
  });
}

export async function getTeacherPayments(organizationId: string, email: string) {
  return readSupabaseData<TeacherPaymentsData>(async (client) => {
    const teacher = await getUserByEmail(client, email);
    const { courses, groups, students } = await getBaseOrganizationData(client, organizationId);
    const teacherGroups = groups.filter((group) => group.teacher_id === teacher.id && group.status !== "archived");
    const groupIds = teacherGroups.map((group) => group.id);
    const [groupStudentsResult, paymentsResult] = await Promise.all([
      groupIds.length > 0
        ? client.from("group_students").select("id,group_id,student_id,status").in("group_id", groupIds)
        : Promise.resolve({ data: [], error: null }),
      client
        .from("payments")
        .select(paymentSelectFields)
        .eq("organization_id", organizationId)
        .order("due_at", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false }),
    ]);
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Ученики преподавателя");
    const payments = rows<PaymentRow>(paymentsResult, "Оплаты учеников преподавателя");
    const activeStudentIds = new Set(
      groupStudents.filter((item) => item.status === "active").map((item) => item.student_id),
    );
    const visiblePayments = payments.filter((payment) => activeStudentIds.has(payment.student_id));
    const attentionPayments = visiblePayments.filter(isPaymentAttention);
    const paidPayments = visiblePayments.filter((payment) => payment.status === "paid");
    const courseMap = byId(courses);
    const groupMap = byId(teacherGroups);
    const studentMap = byId(students.filter((student) => activeStudentIds.has(student.id)));

    return {
      groups: teacherGroups.map((group) => `${group.name} - ${courseMap.get(group.course_id)?.name ?? "курс"}`),
      metrics: [
        { label: "Ученики", value: String(activeStudentIds.size), detail: "в активных группах" },
        { label: "Оплаты", value: String(visiblePayments.length), detail: "доступны для просмотра" },
        { label: "К вниманию", value: String(attentionPayments.length), detail: "срок прошел или просрочено" },
        { label: "Оплачено", value: formatMoney(sumPaymentAmount(paidPayments), "RUB"), detail: "по своим ученикам" },
      ],
      payments: paymentDetails(visiblePayments, studentMap, courseMap, groupMap, false),
    };
  });
}

export async function getStudentPayments(organizationId: string, email: string) {
  return readSupabaseData<StudentPaymentsData>(async (client) => {
    const user = await getUserByEmail(client, email);
    const studentResult = await client
      .from("students")
      .select("id,user_id,name,phone,email,status")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .maybeSingle();
    const student = single<StudentRow>(studentResult, "Карточка ученика");
    const { courses, groups } = await getBaseOrganizationData(client, organizationId);
    const paymentsResult = await client
      .from("payments")
      .select(paymentSelectFields)
      .eq("organization_id", organizationId)
      .eq("student_id", student.id)
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    const payments = rows<PaymentRow>(paymentsResult, "Оплаты ученика");
    const attentionPayments = payments.filter(isPaymentAttention);
    const paidPayments = payments.filter((payment) => payment.status === "paid");
    const courseMap = byId(courses);
    const groupMap = byId(groups);

    return {
      metrics: [
        { label: "Оплаты", value: String(payments.length), detail: "назначенные записи" },
        { label: "К вниманию", value: String(attentionPayments.length), detail: "нужно уточнить оплату" },
        { label: "Оплачено", value: formatMoney(sumPaymentAmount(paidPayments), "RUB"), detail: "по сохраненным оплатам" },
      ],
      payments: paymentDetails(payments, new Map([[student.id, student]]), courseMap, groupMap, false),
      studentName: student.name,
    };
  });
}

export async function getTeacherOverview(organizationId: string, email: string) {
  return readSupabaseData<TeacherOverviewData>(async (client) => {
    const teacher = await getUserByEmail(client, email);
    const { courses, groups, students } = await getBaseOrganizationData(client, organizationId);
    const teacherGroups = groups.filter((group) => group.teacher_id === teacher.id && group.status !== "archived");
    const groupIds = teacherGroups.map((group) => group.id);
    const [groupStudentsResult, lessonsResult, paymentsResult] = await Promise.all([
      groupIds.length > 0
        ? client.from("group_students").select("id,group_id,student_id,status").in("group_id", groupIds)
        : Promise.resolve({ data: [], error: null }),
      groupIds.length > 0
        ? client
            .from("lessons")
            .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
            .eq("organization_id", organizationId)
            .in("group_id", groupIds)
            .gte("starts_at", new Date().toISOString())
            .order("starts_at", { ascending: true })
            .limit(5)
        : Promise.resolve({ data: [], error: null }),
      client
        .from("payments")
        .select("id,student_id,course_id,group_id,amount,currency,period_start,period_end,due_at,status")
        .eq("organization_id", organizationId),
    ]);
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Состав групп преподавателя");
    const lessons = rows<LessonRow>(lessonsResult, "Занятия преподавателя");
    const payments = rows<PaymentRow>(paymentsResult, "Оплата учеников преподавателя");
    const studentIds = new Set(groupStudents.filter((item) => item.status === "active").map((item) => item.student_id));
    const studentMap = byId(students.filter((student) => studentIds.has(student.id)));
    const courseMap = byId(courses);
    const groupMap = byId(teacherGroups);
    const primaryJournalGroup = teacherGroups[0] ?? null;
    const primaryJournalGroupStudents = primaryJournalGroup
      ? groupStudents.filter((item) => item.group_id === primaryJournalGroup.id && item.status === "active").length
      : 0;
    const attentionPayments = payments
      .filter((payment) => studentIds.has(payment.student_id))
      .filter(isPaymentAttention)
      .slice(0, 5);

    return {
      teacherName: teacher.name,
      metrics: [
        { label: "Мои группы", value: String(teacherGroups.length) },
        { label: "Ученики", value: String(studentIds.size) },
        { label: "Ближайшие занятия", value: String(lessons.length) },
        { label: "Оплата к вниманию", value: String(attentionPayments.length) },
      ],
      upcomingLessons: summarizeLessons(lessons, courseMap, groupMap),
      attentionPayments: summarizePayments(attentionPayments, studentMap, courseMap, groupMap),
      journalShortcut: primaryJournalGroup
        ? {
            detail: `${courseMap.get(primaryJournalGroup.course_id)?.name ?? "Курс"}; учеников: ${primaryJournalGroupStudents}`,
            href: `/teacher/groups/${primaryJournalGroup.id}/journal`,
            name: primaryJournalGroup.name,
          }
        : null,
    };
  });
}

export async function getTeacherGroups(organizationId: string, email: string) {
  return readSupabaseData<{ groups: TeacherGroupItem[] }>(async (client) => {
    const teacher = await getUserByEmail(client, email);
    const { courses, groups } = await getBaseOrganizationData(client, organizationId);
    const teacherGroups = groups.filter((group) => group.teacher_id === teacher.id && group.status !== "archived");
    const groupIds = teacherGroups.map((group) => group.id);
    const [groupStudentsResult, lessonsResult, scheduleRulesResult, paymentsResult] = await Promise.all([
      groupIds.length > 0
        ? client.from("group_students").select("id,group_id,student_id,status").in("group_id", groupIds)
        : Promise.resolve({ data: [], error: null }),
      groupIds.length > 0
        ? client
            .from("lessons")
            .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
            .eq("organization_id", organizationId)
            .in("group_id", groupIds)
            .gte("starts_at", new Date().toISOString())
            .order("starts_at", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      groupIds.length > 0
        ? client
            .from("schedule_rules")
            .select("id,target_type,target_id,weekday,start_time,end_time,starts_on,ends_on,status")
            .eq("organization_id", organizationId)
            .eq("target_type", "group")
            .in("target_id", groupIds)
            .eq("status", "active")
        : Promise.resolve({ data: [], error: null }),
      client
        .from("payments")
        .select("id,student_id,course_id,group_id,amount,currency,period_start,period_end,due_at,status")
        .eq("organization_id", organizationId),
    ]);
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Состав групп преподавателя");
    const lessons = rows<LessonRow>(lessonsResult, "Занятия групп преподавателя");
    const scheduleRules = rows<ScheduleRuleRow>(scheduleRulesResult, "Расписание групп преподавателя");
    const payments = rows<PaymentRow>(paymentsResult, "Оплата учеников преподавателя");
    const courseMap = byId(courses);

    return {
      groups: teacherGroups.map((group) => {
        const nextLesson = lessons.find((lesson) => lesson.group_id === group.id);
        const activeGroupStudents = groupStudents.filter((item) => item.group_id === group.id && item.status === "active");
        const activeStudentIds = new Set(activeGroupStudents.map((item) => item.student_id));
        const attentionPayments = payments
          .filter((payment) => activeStudentIds.has(payment.student_id))
          .filter((payment) => payment.group_id === group.id || payment.course_id === group.course_id)
          .filter(isPaymentAttention);
        const problems = [
          activeGroupStudents.length === 0 ? "нет учеников" : null,
          scheduleRules.some((rule) => rule.target_id === group.id) ? null : "нет расписания",
          nextLesson ? null : "нет ближайшего урока",
          attentionPayments.length > 0 ? `оплата: ${attentionPayments.length}` : null,
        ].filter(Boolean);

        return {
          id: group.id,
          name: group.name,
          course: courseMap.get(group.course_id)?.name ?? "Курс",
          status: groupStatusLabel(group.status),
          students: String(activeGroupStudents.length),
          nextLesson: nextLesson ? formatDateTime(nextLesson.starts_at) : "нет ближайшего занятия",
          nextLessonId: nextLesson?.id ?? null,
          problems: problems.join(", ") || "без критичных признаков",
        };
      }),
    };
  });
}

export async function getTeacherGroupDetail(organizationId: string, email: string, groupId: string) {
  return readSupabaseData<TeacherGroupDetailData>(async (client) => {
    const teacher = await getUserByEmail(client, email);
    const { courses, groups, students, users } = await getBaseOrganizationData(client, organizationId);
    const group = groups.find((item) => item.id === groupId && item.teacher_id === teacher.id);

    if (!group) {
      throw new Error("Группа: запись не найдена.");
    }

    const now = new Date().toISOString();
    const [groupStudentsResult, scheduleRulesResult, upcomingLessonsResult, recentLessonsResult, homeworkResult, materialsResult, paymentsResult] =
      await Promise.all([
        client.from("group_students").select("id,group_id,student_id,status").eq("group_id", groupId),
        client
          .from("schedule_rules")
          .select("id,target_type,target_id,weekday,start_time,end_time,starts_on,ends_on,status")
          .eq("organization_id", organizationId)
          .eq("target_type", "group")
          .eq("target_id", groupId)
          .eq("status", "active")
          .order("weekday", { ascending: true })
          .order("start_time", { ascending: true }),
        client
          .from("lessons")
          .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
          .eq("organization_id", organizationId)
          .eq("group_id", groupId)
          .gte("starts_at", now)
          .order("starts_at", { ascending: true })
          .limit(5),
        client
          .from("lessons")
          .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
          .eq("organization_id", organizationId)
          .eq("group_id", groupId)
          .lt("starts_at", now)
          .order("starts_at", { ascending: false })
          .limit(5),
        client
          .from("homework")
          .select("id,course_id,group_id,student_id,title,description,due_at,status")
          .eq("organization_id", organizationId)
          .eq("status", "active")
          .order("due_at", { ascending: true, nullsFirst: false })
          .limit(20),
        client
          .from("materials")
          .select("id,course_id,group_id,student_id,title,type,content,url,visibility,status")
          .eq("organization_id", organizationId)
          .eq("status", "active")
          .limit(20),
        client
          .from("payments")
          .select("id,student_id,course_id,group_id,amount,currency,period_start,period_end,due_at,status")
          .eq("organization_id", organizationId),
      ]);

    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Состав группы преподавателя");
    const scheduleRules = rows<ScheduleRuleRow>(scheduleRulesResult, "Расписание группы преподавателя");
    const upcomingLessons = rows<LessonRow>(upcomingLessonsResult, "Ближайшие занятия группы преподавателя");
    const recentLessons = rows<LessonRow>(recentLessonsResult, "Последние занятия группы преподавателя");
    const homework = rows<HomeworkRow>(homeworkResult, "Домашние задания группы преподавателя");
    const materials = rows<MaterialRow>(materialsResult, "Материалы группы преподавателя");
    const payments = rows<PaymentRow>(paymentsResult, "Оплата группы преподавателя");
    const courseMap = byId(courses);
    const groupMap = new Map([[group.id, group]]);
    const studentMap = byId(students);
    const userMap = byId(users);
    const activeGroupStudents = groupStudents.filter((item) => item.status === "active");
    const activeStudentIds = new Set(activeGroupStudents.map((item) => item.student_id));
    const groupPayments = payments.filter(
      (payment) =>
        activeStudentIds.has(payment.student_id) &&
        (payment.group_id === group.id || payment.course_id === group.course_id),
    );
    const attentionPayments = groupPayments.filter(isPaymentAttention);
    const nextLesson = summarizeLessons(upcomingLessons.slice(0, 1), courseMap, groupMap)[0] ?? null;
    const visibleHomework = homework
      .filter((item) => item.group_id === group.id)
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        title: item.title,
        due: formatDate(item.due_at),
        description: item.description ?? "Описание не заполнено",
      }));
    const visibleMaterials = materials
      .filter((item) => item.group_id === group.id || (item.course_id === group.course_id && !item.student_id))
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        title: item.title,
        detail: `${item.type === "link" ? "ссылка" : "текст"}; ${
          item.visibility === "visible_to_students" ? "видно ученикам" : "только преподавателю"
        }`,
      }));
    const problemSignals: ProblemSignal[] = [
      activeGroupStudents.length === 0
        ? {
            detail: "В активном составе пока нет учеников.",
            label: "Нет учеников",
            tone: "warning",
          }
        : null,
      scheduleRules.length === 0
        ? {
            detail: "Активное расписание для группы не найдено.",
            label: "Нет расписания",
            tone: "warning",
          }
        : null,
      upcomingLessons.length === 0
        ? {
            detail: "Ближайшие занятия еще не созданы.",
            label: "Нет ближайшего урока",
            tone: "warning",
          }
        : null,
      attentionPayments.length > 0
        ? {
            detail: `Есть записи оплаты, которым нужно внимание: ${attentionPayments.length}.`,
            label: "Оплата",
            tone: "danger",
          }
        : null,
    ].filter((item): item is ProblemSignal => item !== null);

    return {
      id: group.id,
      name: group.name,
      course: courseMap.get(group.course_id)?.name ?? "Курс",
      teacher: group.teacher_id ? userMap.get(group.teacher_id)?.name ?? teacher.name : teacher.name,
      status: groupStatusLabel(group.status),
      metrics: [
        { label: "Ученики", value: String(activeGroupStudents.length) },
        { label: "Расписание", value: String(scheduleRules.length) },
        { label: "Ближайшие уроки", value: String(upcomingLessons.length) },
        { label: "Оплата к вниманию", value: String(attentionPayments.length) },
      ],
      nextLesson,
      problemSignals,
      students: activeGroupStudents.map((item) => {
        const student = studentMap.get(item.student_id);
        const studentPayment = groupPayments.find((payment) => payment.student_id === item.student_id && isPaymentAttention(payment)) ??
          groupPayments.find((payment) => payment.student_id === item.student_id);

        return {
          id: item.student_id,
          name: student?.name ?? "Ученик",
          contacts: [student?.phone, student?.email].filter(Boolean).join(", ") || "контакты не заполнены",
          status: statusLabel(item.status),
          payment: studentPayment
            ? `${formatMoney(studentPayment.amount, studentPayment.currency)} - ${describePaymentStatus(studentPayment)}`
            : "не настроена",
        };
      }),
      scheduleRules: summarizeScheduleRules(scheduleRules),
      recentLessons: summarizeLessons(recentLessons, courseMap, groupMap),
      homework: visibleHomework,
      materials: visibleMaterials,
      paymentSignals: summarizePayments(attentionPayments.slice(0, 5), studentMap, courseMap, groupMap),
    };
  });
}

export async function getTeacherGroupJournal(organizationId: string, email: string, groupId: string, month: string | null | undefined) {
  return readSupabaseData<TeacherGroupJournalData>(async (client) => {
    const teacher = await getUserByEmail(client, email);
    const { courses, groups, students, users } = await getBaseOrganizationData(client, organizationId);
    const group = groups.find((item) => item.id === groupId && item.teacher_id === teacher.id);

    if (!group) {
      throw new Error("Группа: запись не найдена.");
    }

    const monthValue = normalizeMonthValue(month);
    const nextMonth = addMonthValue(monthValue, 1);
    const [lessonsResult, groupStudentsResult] = await Promise.all([
      client
        .from("lessons")
        .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
        .eq("organization_id", organizationId)
        .eq("group_id", groupId)
        .gte("starts_at", monthBoundaryIso(monthValue))
        .lt("starts_at", monthBoundaryIso(nextMonth))
        .order("starts_at", { ascending: true }),
      client.from("group_students").select("id,group_id,student_id,status").eq("group_id", groupId),
    ]);

    const lessons = rows<LessonRow>(lessonsResult, "Уроки журнала группы");
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Состав журнала группы");
    const lessonIds = lessons.map((lesson) => lesson.id);
    const activeGroupStudents = groupStudents.filter((item) => item.status === "active");
    const activeStudentIds = new Set(activeGroupStudents.map((item) => item.student_id));
    const [journalResult, progressResult, homeworkResult, materialsResult] = await Promise.all([
      lessonIds.length > 0
        ? client
            .from("journal_entries")
            .select("id,lesson_id,student_id,attendance_mark,lesson_mark,teacher_comment,internal_comment,is_visible_to_student")
            .in("lesson_id", lessonIds)
        : Promise.resolve({ data: [], error: null }),
      lessonIds.length > 0
        ? client.from("progress_records").select("id,lesson_id,student_id").eq("organization_id", organizationId).in("lesson_id", lessonIds)
        : Promise.resolve({ data: [], error: null }),
      lessonIds.length > 0
        ? client
            .from("homework")
            .select("id,course_id,group_id,student_id,lesson_id,title,description,due_at,status")
            .eq("organization_id", organizationId)
            .eq("status", "active")
            .in("lesson_id", lessonIds)
        : Promise.resolve({ data: [], error: null }),
      lessonIds.length > 0
        ? client
            .from("materials")
            .select("id,course_id,group_id,student_id,lesson_id,homework_id,title,type,content,url,visibility,status")
            .eq("organization_id", organizationId)
            .eq("status", "active")
        : Promise.resolve({ data: [], error: null }),
    ]);

    const journalEntries = rows<JournalEntryRow>(journalResult, "Записи журнала группы").filter((entry) =>
      activeStudentIds.has(entry.student_id),
    );
    const progressRecords = rows<ProgressRecordLessonRow>(progressResult, "Прогресс журнала группы").filter(
      (record) => record.lesson_id && activeStudentIds.has(record.student_id),
    );
    const homework = rows<HomeworkRow>(homeworkResult, "Домашние задания журнала группы");
    const materials = rows<MaterialRow>(materialsResult, "Материалы журнала группы").filter(
      (material) => material.group_id === group.id || material.course_id === group.course_id,
    );
    const courseMap = byId(courses);
    const studentMap = byId(students);
    const userMap = byId(users);
    const journalEntryMap = new Map(journalEntries.map((entry) => [journalKey(entry.lesson_id, entry.student_id), entry]));
    const progressKeys = new Set(
      progressRecords
        .filter((record): record is ProgressRecordLessonRow & { lesson_id: string } => record.lesson_id !== null)
        .map((record) => journalKey(record.lesson_id, record.student_id)),
    );
    const homeworkByLessonId = new Map<string, HomeworkRow[]>();
    const homeworkIdToLessonId = new Map<string, string>();

    for (const item of homework) {
      if (!item.lesson_id) {
        continue;
      }

      const items = homeworkByLessonId.get(item.lesson_id) ?? [];
      items.push(item);
      homeworkByLessonId.set(item.lesson_id, items);
      homeworkIdToLessonId.set(item.id, item.lesson_id);
    }

    const materialLessonIds = new Set(
      materials
        .map((material) => material.lesson_id ?? (material.homework_id ? homeworkIdToLessonId.get(material.homework_id) : null))
        .filter((lessonId): lessonId is string => Boolean(lessonId)),
    );
    const now = Date.now();
    const journalLessons = lessons.map((lesson) => ({
      id: lesson.id,
      day: formatDateShort(lesson.starts_at),
      isWeekStart: isMoscowMonday(lesson.starts_at),
      timeRange: `${formatTimeOfDate(lesson.starts_at)}-${formatTimeOfDate(lesson.ends_at)}`,
      topic: lesson.topic ?? courseMap.get(lesson.course_id)?.name ?? "Урок",
      weekday: weekdayShortLabel(lesson.starts_at),
    }));
    const journalStudents = activeGroupStudents
      .map((item) => {
        const student = studentMap.get(item.student_id);
        const name = student?.name ?? "Ученик";

        return {
          id: item.student_id,
          name,
          status: statusLabel(item.status),
          cells: lessons.map((lesson) => {
            const key = journalKey(lesson.id, item.student_id);
            const entry = journalEntryMap.get(key);
            const attendanceMark = normalizeAttendanceMark(entry?.attendance_mark ?? null);
            const isFuture = new Date(lesson.starts_at).getTime() > now;
            const indicators = [
              entry?.lesson_mark ? `Оценка ${entry.lesson_mark}` : null,
              entry?.teacher_comment ? "Комментарий" : null,
              entry?.internal_comment ? "Внутренний комментарий" : null,
              progressKeys.has(key) ? "Прогресс" : null,
              homeworkByLessonId.has(lesson.id) ? "ДЗ" : null,
              materialLessonIds.has(lesson.id) ? "Материал" : null,
              !isFuture && entry && !attendanceMark ? "Пусто = П" : null,
            ].filter((indicator): indicator is string => indicator !== null);

            return {
              attendanceMark,
              attendanceTone: attendanceTone(attendanceMark, isFuture, Boolean(entry)),
              id: key,
              indicators,
              isFuture,
              lessonId: lesson.id,
              markValue: manualJournalMarkValue(entry),
              studentId: item.student_id,
            };
          }),
        };
      })
      .sort((left, right) => left.name.localeCompare(right.name, "ru"));

    return {
      id: group.id,
      name: group.name,
      course: courseMap.get(group.course_id)?.name ?? "Курс",
      teacher: group.teacher_id ? userMap.get(group.teacher_id)?.name ?? teacher.name : teacher.name,
      status: groupStatusLabel(group.status),
      monthLabel: formatMonthLabel(monthValue),
      monthValue,
      previousMonth: addMonthValue(monthValue, -1),
      nextMonth,
      lessons: journalLessons,
      students: journalStudents,
      savedEntries: String(journalEntries.length),
    };
  });
}

export async function getTeacherLessonDetail(organizationId: string, email: string, lessonId: string) {
  return readSupabaseData<TeacherLessonData>(async (client) => {
    const teacher = await getUserByEmail(client, email);
    const lessonResult = await client
      .from("lessons")
      .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic,summary")
      .eq("organization_id", organizationId)
      .eq("id", lessonId)
      .maybeSingle();

    if (lessonResult.error) {
      throw new Error(`Урок: ${lessonResult.error.message}`);
    }

    const lesson = lessonResult.data as LessonRow | null;

    if (!lesson || lesson.teacher_id !== teacher.id || !lesson.group_id) {
      throw new Error("Урок: запись не найдена.");
    }

    const { courses, groups, students, users } = await getBaseOrganizationData(client, organizationId);
    const group = groups.find((item) => item.id === lesson.group_id && item.teacher_id === teacher.id);
    const course = courses.find((item) => item.id === lesson.course_id);

    if (!group || !course) {
      throw new Error("Урок: запись не найдена.");
    }

    const [groupStudentsResult, journalResult, progressResult, homeworkResult, materialsResult] = await Promise.all([
      client.from("group_students").select("id,group_id,student_id,status").eq("group_id", group.id),
      client
        .from("journal_entries")
        .select("id,lesson_id,student_id,attendance_mark,lesson_mark,teacher_comment,internal_comment,is_visible_to_student")
        .eq("lesson_id", lesson.id),
      client
        .from("progress_records")
        .select("id,lesson_id,student_id")
        .eq("organization_id", organizationId)
        .eq("lesson_id", lesson.id),
      client
        .from("homework")
        .select("id,course_id,group_id,student_id,lesson_id,title,description,due_at,status")
        .eq("organization_id", organizationId)
        .eq("lesson_id", lesson.id)
        .eq("status", "active")
        .order("due_at", { ascending: true, nullsFirst: false }),
      client
        .from("materials")
        .select("id,course_id,group_id,student_id,lesson_id,homework_id,title,type,content,url,visibility,status")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .order("created_at", { ascending: true }),
    ]);

    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Состав урока");
    const activeGroupStudents = groupStudents.filter((item) => item.status === "active");
    const activeStudentIds = new Set(activeGroupStudents.map((item) => item.student_id));
    const journalEntries = rows<JournalEntryRow>(journalResult, "Записи урока").filter((entry) =>
      activeStudentIds.has(entry.student_id),
    );
    const progressRecords = rows<ProgressRecordLessonRow>(progressResult, "Прогресс урока").filter((record) =>
      activeStudentIds.has(record.student_id),
    );
    const homework = rows<HomeworkRow>(homeworkResult, "Домашние задания урока");
    const homeworkIds = new Set(homework.map((item) => item.id));
    const materials = rows<MaterialRow>(materialsResult, "Материалы урока").filter(
      (material) =>
        material.lesson_id === lesson.id ||
        (material.homework_id ? homeworkIds.has(material.homework_id) : false),
    );
    const studentMap = byId(students);
    const userMap = byId(users);
    const journalEntryMap = new Map(journalEntries.map((entry) => [entry.student_id, entry]));
    const progressStudentIds = new Set(progressRecords.map((record) => record.student_id));

    return {
      course: course.name,
      group: group.name,
      groupHref: `/teacher/groups/${group.id}`,
      homework: homework.map((item) => ({
        description: item.description ?? "Описание не заполнено",
        due: formatDate(item.due_at),
        id: item.id,
        title: item.title,
      })),
      id: lesson.id,
      journalHref: `/teacher/groups/${group.id}/journal`,
      lessonMarkOptions: lessonMarkOptions(course.lesson_mark_scale),
      lessonMarkScale: lessonMarkScaleLabel(course.lesson_mark_scale),
      materials: materials.map((item) => ({
        content: item.content ?? "",
        detail: `${materialTypeLabel(item.type)}; ${materialVisibilityLabel(item.visibility)}`,
        id: item.id,
        title: item.title,
        url: item.url,
      })),
      savedEntries: String(journalEntries.length),
      startsAtLabel: formatDateLong(lesson.starts_at),
      students: activeGroupStudents
        .map((item) => {
          const student = studentMap.get(item.student_id);
          const entry = journalEntryMap.get(item.student_id);

          return {
            contacts: [student?.phone, student?.email].filter(Boolean).join(", ") || "контакты не заполнены",
            hasProgressRecord: progressStudentIds.has(item.student_id),
            id: item.student_id,
            journalEntry: {
              attendanceMark: normalizeAttendanceMark(entry?.attendance_mark ?? null),
              internalComment: entry?.internal_comment ?? "",
              isVisibleToStudent: entry?.is_visible_to_student ?? false,
              lessonMark: entry?.lesson_mark ?? "",
              teacherComment: entry?.teacher_comment ?? "",
            },
            name: student?.name ?? "Ученик",
            progressHref: `/teacher/students/${item.student_id}`,
            status: statusLabel(item.status),
          };
        })
        .sort((left, right) => left.name.localeCompare(right.name, "ru")),
      summary: lesson.summary ?? "",
      teacher: userMap.get(teacher.id)?.name ?? teacher.name,
      timeRange: `${formatTimeOfDate(lesson.starts_at)}-${formatTimeOfDate(lesson.ends_at)}`,
      topic: lesson.topic ?? "",
    };
  });
}

export async function getTeacherStudentDetail(organizationId: string, email: string, studentId: string) {
  return readSupabaseData<TeacherStudentDetailData>(async (client) => {
    const teacher = await getUserByEmail(client, email);
    const { courses, groups, students } = await getBaseOrganizationData(client, organizationId);
    const student = students.find((item) => item.id === studentId);
    const teacherGroups = groups.filter((group) => group.teacher_id === teacher.id);
    const teacherGroupIds = teacherGroups.map((group) => group.id);
    const groupStudentsResult =
      teacherGroupIds.length > 0
        ? await client
            .from("group_students")
            .select("id,group_id,student_id,status")
            .in("group_id", teacherGroupIds)
            .eq("student_id", studentId)
        : { data: [], error: null };
    const memberships = rows<GroupStudentRow>(groupStudentsResult, "Группы ученика преподавателя").filter(
      (membership) => membership.status === "active",
    );

    if (!student || memberships.length === 0) {
      throw new Error("Ученик: запись не найдена.");
    }

    const groupMap = byId(teacherGroups);
    const courseMap = byId(courses);
    const activeGroupIds = new Set(memberships.map((membership) => membership.group_id));
    const courseIds = new Set(
      memberships
        .map((membership) => groupMap.get(membership.group_id)?.course_id)
        .filter((courseId): courseId is string => Boolean(courseId)),
    );
    const courseIdList = [...courseIds];
    const activeGroupIdList = [...activeGroupIds];
    const [rulesResult, errorsResult, recordsResult, lessonsResult, homeworkResult, materialsResult, paymentsResult] =
      await Promise.all([
        courseIdList.length > 0
          ? client
              .from("student_progress_rules")
              .select("id,student_id,course_id,name,level,note,is_visible_to_student,is_active")
              .eq("organization_id", organizationId)
              .eq("student_id", studentId)
              .in("course_id", courseIdList)
              .order("sort_order", { ascending: true })
              .order("created_at", { ascending: true })
          : Promise.resolve({ data: [], error: null }),
        courseIdList.length > 0
          ? client
              .from("student_progress_errors")
              .select("id,student_id,course_id,name,note,is_visible_to_student,is_active")
              .eq("organization_id", organizationId)
              .eq("student_id", studentId)
              .in("course_id", courseIdList)
              .order("created_at", { ascending: true })
          : Promise.resolve({ data: [], error: null }),
        courseIdList.length > 0
          ? client
              .from("progress_records")
              .select("id,student_id,course_id,lesson_id,repeat_note,student_comment,internal_comment,is_visible_to_student,created_at")
              .eq("organization_id", organizationId)
              .eq("student_id", studentId)
              .in("course_id", courseIdList)
              .order("created_at", { ascending: false })
              .limit(12)
          : Promise.resolve({ data: [], error: null }),
        activeGroupIdList.length > 0
          ? client
              .from("lessons")
              .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
              .eq("organization_id", organizationId)
              .in("group_id", activeGroupIdList)
              .order("starts_at", { ascending: false })
              .limit(12)
          : Promise.resolve({ data: [], error: null }),
        client
          .from("homework")
          .select("id,course_id,group_id,student_id,lesson_id,title,description,due_at,status")
          .eq("organization_id", organizationId)
          .eq("status", "active")
          .order("due_at", { ascending: true, nullsFirst: false })
          .limit(30),
        client
          .from("materials")
          .select("id,course_id,group_id,student_id,lesson_id,homework_id,title,type,content,url,visibility,status")
          .eq("organization_id", organizationId)
          .eq("status", "active")
          .limit(30),
        client
          .from("payments")
          .select("id,student_id,course_id,group_id,amount,currency,period_start,period_end,due_at,status")
          .eq("organization_id", organizationId)
          .eq("student_id", studentId),
      ]);
    const rules = rows<ProgressRuleRow>(rulesResult, "Правила прогресса ученика");
    const errors = rows<ProgressErrorRow>(errorsResult, "Ошибки прогресса ученика");
    const records = rows<ProgressRecordRow>(recordsResult, "Записи прогресса ученика");
    const lessons = rows<LessonRow>(lessonsResult, "Уроки ученика");
    const homework = rows<HomeworkRow>(homeworkResult, "Домашние задания ученика").filter(
      (item) => item.student_id === studentId || (item.group_id ? activeGroupIds.has(item.group_id) : false),
    );
    const materials = rows<MaterialRow>(materialsResult, "Материалы ученика").filter(
      (item) =>
        item.student_id === studentId ||
        (item.group_id ? activeGroupIds.has(item.group_id) : false) ||
        (item.course_id ? courseIds.has(item.course_id) && !item.group_id && !item.student_id : false),
    );
    const payments = rows<PaymentRow>(paymentsResult, "Оплата ученика");
    const lessonMap = byId(lessons);
    const visibleGroups = memberships
      .map((membership) => groupMap.get(membership.group_id))
      .filter((group): group is GroupRow => Boolean(group));
    const courseOptions = courseIdList.map((courseId) => ({
      label: courseMap.get(courseId)?.name ?? "Курс",
      value: courseId,
    }));

    return {
      contacts: [student.phone, student.email].filter(Boolean).join(", ") || "контакты не заполнены",
      courseOptions,
      errors: errors.map((item) => ({
        course: courseMap.get(item.course_id)?.name ?? "Курс",
        courseId: item.course_id,
        id: item.id,
        isActive: item.is_active,
        isVisibleToStudent: item.is_visible_to_student,
        name: item.name,
        note: item.note ?? "",
      })),
      groups: visibleGroups.map((group) => `${group.name} - ${courseMap.get(group.course_id)?.name ?? "курс"}`),
      homework: homework.slice(0, 6).map((item) => ({
        description: item.description ?? "Описание не заполнено",
        due: formatDate(item.due_at),
        id: item.id,
        title: item.title,
      })),
      id: student.id,
      lessonOptions: lessons.map((lesson) => ({
        label: `${formatDateTime(lesson.starts_at)} - ${lesson.topic ?? courseMap.get(lesson.course_id)?.name ?? "урок"}`,
        value: lesson.id,
      })),
      lessons: summarizeLessons(lessons.slice(0, 6), courseMap, groupMap),
      materials: materials.slice(0, 6).map((item) => ({
        detail: `${materialTypeLabel(item.type)}; ${materialVisibilityLabel(item.visibility)}`,
        id: item.id,
        title: item.title,
      })),
      metrics: [
        { label: "Группы", value: String(visibleGroups.length) },
        { label: "Правила", value: String(rules.filter((item) => item.is_active).length) },
        { label: "Ошибки", value: String(errors.filter((item) => item.is_active).length) },
        { label: "Записи прогресса", value: String(records.length) },
      ],
      name: student.name,
      payments: summarizePayments(payments, new Map([[student.id, student]]), courseMap, groupMap),
      records: records.map((item) => {
        const lesson = item.lesson_id ? lessonMap.get(item.lesson_id) : null;

        return {
          course: courseMap.get(item.course_id)?.name ?? "Курс",
          courseId: item.course_id,
          createdAt: formatDateTime(item.created_at),
          id: item.id,
          internalComment: item.internal_comment ?? "",
          isVisibleToStudent: item.is_visible_to_student,
          lesson: lesson
            ? `${formatDateTime(lesson.starts_at)} - ${lesson.topic ?? courseMap.get(lesson.course_id)?.name ?? "урок"}`
            : "без связи с уроком",
          lessonId: item.lesson_id,
          repeatNote: item.repeat_note ?? "",
          studentComment: item.student_comment ?? "",
        };
      }),
      rules: rules.map((item) => ({
        course: courseMap.get(item.course_id)?.name ?? "Курс",
        courseId: item.course_id,
        id: item.id,
        isActive: item.is_active,
        isVisibleToStudent: item.is_visible_to_student,
        level: progressLevelLabel(item.level),
        levelValue: item.level ?? "",
        name: item.name,
        note: item.note ?? "",
      })),
      status: statusLabel(student.status),
    };
  });
}

export async function getTeacherHomework(organizationId: string, email: string) {
  return readSupabaseData<TeacherHomeworkData>(async (client) => {
    const teacher = await getUserByEmail(client, email);
    const { courses, groups, students } = await getBaseOrganizationData(client, organizationId);
    const teacherGroups = groups.filter((group) => group.teacher_id === teacher.id);
    const teacherGroupIds = teacherGroups.map((group) => group.id);
    const teacherGroupIdSet = new Set(teacherGroupIds);
    const [groupStudentsResult, lessonsResult, homeworkResult, materialsResult] = await Promise.all([
      teacherGroupIds.length > 0
        ? client.from("group_students").select("id,group_id,student_id,status").in("group_id", teacherGroupIds)
        : Promise.resolve({ data: [], error: null }),
      teacherGroupIds.length > 0
        ? client
            .from("lessons")
            .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
            .eq("organization_id", organizationId)
            .in("group_id", teacherGroupIds)
            .order("starts_at", { ascending: false })
            .limit(60)
        : Promise.resolve({ data: [], error: null }),
      teacherGroupIds.length > 0
        ? client
            .from("homework")
            .select("id,course_id,group_id,student_id,lesson_id,title,description,due_at,status")
            .eq("organization_id", organizationId)
            .neq("status", "archived")
            .order("due_at", { ascending: true, nullsFirst: false })
            .limit(100)
        : Promise.resolve({ data: [], error: null }),
      teacherGroupIds.length > 0
        ? client
            .from("materials")
            .select("id,course_id,group_id,student_id,lesson_id,homework_id,title,type,content,url,visibility,status")
            .eq("organization_id", organizationId)
            .neq("status", "archived")
            .order("created_at", { ascending: false })
            .limit(200)
        : Promise.resolve({ data: [], error: null }),
    ]);
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Ученики групп преподавателя");
    const lessons = rows<LessonRow>(lessonsResult, "Уроки преподавателя");
    const homeworkRows = rows<HomeworkRow>(homeworkResult, "Домашние задания преподавателя");
    const materials = rows<MaterialRow>(materialsResult, "Материалы домашних заданий преподавателя");
    const activeMemberships = groupStudents.filter((membership) => membership.status === "active");
    const activeStudentIds = new Set(activeMemberships.map((membership) => membership.student_id));
    const courseMap = byId(courses);
    const groupMap = byId(teacherGroups);
    const studentMap = byId(students);
    const lessonMap = byId(lessons);
    const visibleHomework = homeworkRows.filter(
      (item) =>
        (item.group_id ? teacherGroupIdSet.has(item.group_id) : false) ||
        (item.student_id ? activeStudentIds.has(item.student_id) : false) ||
        (item.lesson_id ? lessonMap.has(item.lesson_id) : false),
    );
    const homeworkIds = new Set(visibleHomework.map((item) => item.id));
    const materialsByHomeworkId = new Map<string, LearningMaterialItem[]>();

    for (const material of materials.filter((item) => item.homework_id && homeworkIds.has(item.homework_id))) {
      const existing = materialsByHomeworkId.get(material.homework_id ?? "") ?? [];
      existing.push({
        content: material.content ?? "",
        detail: `${materialTypeLabel(material.type)}; ${materialVisibilityLabel(material.visibility)}; ${materialStatusLabel(material.status)}`,
        id: material.id,
        title: material.title,
        url: material.url,
      });
      materialsByHomeworkId.set(material.homework_id ?? "", existing);
    }

    const studentIds = [...new Set(activeMemberships.map((membership) => membership.student_id))].sort((left, right) =>
      (studentMap.get(left)?.name ?? "").localeCompare(studentMap.get(right)?.name ?? "", "ru"),
    );

    return {
      groupOptions: teacherGroups
        .filter((group) => group.status === "active" || group.status === "recruiting")
        .map((group) => ({ label: `${group.name} - ${courseMap.get(group.course_id)?.name ?? "курс"}`, value: group.id })),
      homework: visibleHomework.map((item) => {
        const group = item.group_id ? groupMap.get(item.group_id) : null;
        const student = item.student_id ? studentMap.get(item.student_id) : null;
        const lesson = item.lesson_id ? lessonMap.get(item.lesson_id) : null;

        return {
          context: group ? `${group.name} - ${courseMap.get(group.course_id)?.name ?? "курс"}` : "учебный контекст",
          description: item.description ?? "Описание не заполнено",
          due: formatDate(item.due_at),
          id: item.id,
          lesson: lesson
            ? `${formatDateTime(lesson.starts_at)} - ${lesson.topic ?? courseMap.get(lesson.course_id)?.name ?? "урок"}`
            : "без связи с уроком",
          materials: materialsByHomeworkId.get(item.id) ?? [],
          status: homeworkStatusLabel(item.status),
          statusValue: item.status,
          student: student ? student.name : "вся группа",
          title: item.title,
        };
      }),
      lessonOptions: lessons.map((lesson) => ({
        label: `${formatDateTime(lesson.starts_at)} - ${groupMap.get(lesson.group_id ?? "")?.name ?? "группа"} - ${
          lesson.topic ?? courseMap.get(lesson.course_id)?.name ?? "урок"
        }`,
        value: lesson.id,
      })),
      metrics: [
        { label: "Задания", value: String(visibleHomework.length) },
        { label: "Активные", value: String(visibleHomework.filter((item) => item.status === "active").length) },
        { label: "Индивидуальные", value: String(visibleHomework.filter((item) => item.student_id).length) },
        { label: "Материалы к ДЗ", value: String([...materialsByHomeworkId.values()].flat().length) },
      ],
      studentOptions: studentIds.map((studentId) => {
        const studentGroups = activeMemberships
          .filter((membership) => membership.student_id === studentId)
          .map((membership) => groupMap.get(membership.group_id)?.name)
          .filter(Boolean)
          .join(", ");

        return {
          label: `${studentMap.get(studentId)?.name ?? "Ученик"} - ${studentGroups || "группа"}`,
          value: studentId,
        };
      }),
    };
  });
}

export async function getTeacherMaterials(organizationId: string, email: string) {
  return readSupabaseData<TeacherMaterialsData>(async (client) => {
    const teacher = await getUserByEmail(client, email);
    const { courses, groups, students } = await getBaseOrganizationData(client, organizationId);
    const teacherGroups = groups.filter((group) => group.teacher_id === teacher.id);
    const teacherGroupIds = teacherGroups.map((group) => group.id);
    const teacherGroupIdSet = new Set(teacherGroupIds);
    const teacherCourseIds = new Set(teacherGroups.map((group) => group.course_id));
    const [groupStudentsResult, lessonsResult, homeworkResult, materialsResult] = await Promise.all([
      teacherGroupIds.length > 0
        ? client.from("group_students").select("id,group_id,student_id,status").in("group_id", teacherGroupIds)
        : Promise.resolve({ data: [], error: null }),
      teacherGroupIds.length > 0
        ? client
            .from("lessons")
            .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
            .eq("organization_id", organizationId)
            .in("group_id", teacherGroupIds)
            .order("starts_at", { ascending: false })
            .limit(60)
        : Promise.resolve({ data: [], error: null }),
      teacherGroupIds.length > 0
        ? client
            .from("homework")
            .select("id,course_id,group_id,student_id,lesson_id,title,description,due_at,status")
            .eq("organization_id", organizationId)
            .neq("status", "archived")
            .limit(100)
        : Promise.resolve({ data: [], error: null }),
      teacherGroupIds.length > 0
        ? client
            .from("materials")
            .select("id,course_id,group_id,student_id,lesson_id,homework_id,title,type,content,url,visibility,status")
            .eq("organization_id", organizationId)
            .neq("status", "archived")
            .order("created_at", { ascending: false })
            .limit(200)
        : Promise.resolve({ data: [], error: null }),
    ]);
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Ученики групп преподавателя");
    const lessons = rows<LessonRow>(lessonsResult, "Уроки материалов преподавателя");
    const homework = rows<HomeworkRow>(homeworkResult, "Домашние задания материалов преподавателя").filter(
      (item) => (item.group_id ? teacherGroupIdSet.has(item.group_id) : false),
    );
    const materials = rows<MaterialRow>(materialsResult, "Материалы преподавателя");
    const activeMemberships = groupStudents.filter((membership) => membership.status === "active");
    const activeStudentIds = new Set(activeMemberships.map((membership) => membership.student_id));
    const lessonMap = byId(lessons);
    const homeworkMap = byId(homework);
    const groupMap = byId(teacherGroups);
    const courseMap = byId(courses);
    const studentMap = byId(students);
    const homeworkIds = new Set(homework.map((item) => item.id));
    const lessonIds = new Set(lessons.map((lesson) => lesson.id));
    const visibleMaterials = materials.filter(
      (item) =>
        (item.group_id ? teacherGroupIdSet.has(item.group_id) : false) ||
        (item.course_id ? teacherCourseIds.has(item.course_id) && !item.group_id && !item.student_id : false) ||
        (item.student_id ? activeStudentIds.has(item.student_id) : false) ||
        (item.lesson_id ? lessonIds.has(item.lesson_id) : false) ||
        (item.homework_id ? homeworkIds.has(item.homework_id) : false),
    );
    const studentContextOptions = activeMemberships
      .map((membership) => {
        const student = studentMap.get(membership.student_id);
        const group = groupMap.get(membership.group_id);

        return student && group
          ? {
              label: `Ученик: ${student.name} - ${group.name}`,
              value: `student:${student.id}:${group.id}`,
            }
          : null;
      })
      .filter((item): item is SelectOption => item !== null);
    const contextOptions: SelectOption[] = [
      ...[...teacherCourseIds].map((courseId) => ({
        label: `Курс: ${courseMap.get(courseId)?.name ?? "курс"}`,
        value: `course:${courseId}`,
      })),
      ...teacherGroups.map((group) => ({
        label: `Группа: ${group.name}`,
        value: `group:${group.id}`,
      })),
      ...lessons.slice(0, 30).map((lesson) => ({
        label: `Урок: ${formatDateTime(lesson.starts_at)} - ${groupMap.get(lesson.group_id ?? "")?.name ?? "группа"}`,
        value: `lesson:${lesson.id}`,
      })),
      ...homework.slice(0, 30).map((item) => ({
        label: `ДЗ: ${item.title}`,
        value: `homework:${item.id}`,
      })),
      ...studentContextOptions,
    ];

    function materialContext(item: MaterialRow) {
      if (item.homework_id && homeworkMap.has(item.homework_id)) {
        return `ДЗ: ${homeworkMap.get(item.homework_id)?.title}`;
      }

      if (item.lesson_id && lessonMap.has(item.lesson_id)) {
        const lesson = lessonMap.get(item.lesson_id);
        return `Урок: ${formatDateTime(lesson?.starts_at)} - ${lesson?.topic ?? courseMap.get(lesson?.course_id ?? "")?.name ?? "курс"}`;
      }

      if (item.student_id && studentMap.has(item.student_id)) {
        return `Ученик: ${studentMap.get(item.student_id)?.name}`;
      }

      if (item.group_id && groupMap.has(item.group_id)) {
        return `Группа: ${groupMap.get(item.group_id)?.name}`;
      }

      if (item.course_id && courseMap.has(item.course_id)) {
        return `Курс: ${courseMap.get(item.course_id)?.name}`;
      }

      return "учебный контекст";
    }

    return {
      contextOptions,
      materials: visibleMaterials.map((item) => ({
        content: item.content ?? "",
        context: materialContext(item),
        detail: materialTypeLabel(item.type),
        id: item.id,
        status: materialStatusLabel(item.status),
        statusValue: item.status,
        title: item.title,
        url: item.url,
        visibility: materialVisibilityLabel(item.visibility),
        visibilityValue: item.visibility,
      })),
      metrics: [
        { label: "Материалы", value: String(visibleMaterials.length) },
        { label: "Открытые ученикам", value: String(visibleMaterials.filter((item) => item.visibility === "visible_to_students").length) },
        { label: "Ссылки", value: String(visibleMaterials.filter((item) => item.type === "link").length) },
        { label: "Скрытые", value: String(visibleMaterials.filter((item) => item.status === "hidden").length) },
      ],
    };
  });
}

export async function getTeacherStudents(organizationId: string, email: string) {
  return readSupabaseData<{ students: TeacherStudentItem[] }>(async (client) => {
    const teacher = await getUserByEmail(client, email);
    const { groups, students } = await getBaseOrganizationData(client, organizationId);
    const teacherGroups = groups.filter((group) => group.teacher_id === teacher.id);
    const groupIds = teacherGroups.map((group) => group.id);
    const groupMap = byId(teacherGroups);
    const [groupStudentsResult, paymentsResult] = await Promise.all([
      groupIds.length > 0
        ? client.from("group_students").select("id,group_id,student_id,status").in("group_id", groupIds)
        : Promise.resolve({ data: [], error: null }),
      client
        .from("payments")
        .select("id,student_id,course_id,group_id,amount,currency,period_start,period_end,due_at,status")
        .eq("organization_id", organizationId),
    ]);
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Ученики преподавателя");
    const payments = rows<PaymentRow>(paymentsResult, "Оплата учеников преподавателя");
    const studentIds = new Set(groupStudents.filter((item) => item.status === "active").map((item) => item.student_id));
    const visibleStudents = students.filter((student) => studentIds.has(student.id));

    return {
      students: visibleStudents.map((student) => {
        const activeGroups = groupStudents
          .filter((item) => item.student_id === student.id && item.status === "active")
          .map((item) => groupMap.get(item.group_id)?.name)
          .filter(Boolean);
        const attentionPayment = payments
          .filter((payment) => payment.student_id === student.id)
          .find(isPaymentAttention);

        return {
          id: student.id,
          name: student.name,
          contacts: [student.phone, student.email].filter(Boolean).join(", ") || "контакты не заполнены",
          groups: activeGroups.join(", ") || "нет активной группы",
          payment: attentionPayment
            ? `${formatMoney(attentionPayment.amount, attentionPayment.currency)} - ${describePaymentStatus(attentionPayment)}`
            : "без внимания",
        };
      }),
    };
  });
}

export async function getStudentHomework(organizationId: string, email: string) {
  return readSupabaseData<StudentHomeworkData>(async (client) => {
    const user = await getUserByEmail(client, email);
    const studentResult = await client
      .from("students")
      .select("id,user_id,name,phone,email,status")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .maybeSingle();
    const student = single<StudentRow>(studentResult, "Карточка ученика");
    const { courses, groups } = await getBaseOrganizationData(client, organizationId);
    const groupStudentsResult = await client
      .from("group_students")
      .select("id,group_id,student_id,status")
      .eq("student_id", student.id);
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Группы ученика");
    const visibleGroups = activeWorkspaceGroups(groups, groupStudents);
    const activeGroupIds = new Set(visibleGroups.map((group) => group.id));
    const [lessonsResult, homeworkResult, materialsResult] = await Promise.all([
      activeGroupIds.size > 0
        ? client
            .from("lessons")
            .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
            .eq("organization_id", organizationId)
            .in("group_id", [...activeGroupIds])
            .order("starts_at", { ascending: false })
            .limit(80)
        : Promise.resolve({ data: [], error: null }),
      client
        .from("homework")
        .select("id,course_id,group_id,student_id,lesson_id,title,description,due_at,status")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .order("due_at", { ascending: true, nullsFirst: false })
        .limit(100),
      client
        .from("materials")
        .select("id,course_id,group_id,student_id,lesson_id,homework_id,title,type,content,url,visibility,status")
        .eq("organization_id", organizationId)
        .eq("visibility", "visible_to_students")
        .eq("status", "active")
        .limit(200),
    ]);
    const lessons = rows<LessonRow>(lessonsResult, "Уроки домашнего задания ученика");
    const lessonMap = byId(lessons);
    const lessonIds = new Set(lessons.map((lesson) => lesson.id));
    const homework = rows<HomeworkRow>(homeworkResult, "Домашние задания ученика").filter(
      (item) =>
        item.student_id === student.id ||
        (item.group_id ? activeGroupIds.has(item.group_id) : false) ||
        (item.lesson_id ? lessonIds.has(item.lesson_id) : false),
    );
    const homeworkIds = new Set(homework.map((item) => item.id));
    const materials = rows<MaterialRow>(materialsResult, "Материалы домашнего задания ученика");
    const courseMap = byId(courses);
    const groupMap = byId(visibleGroups);
    const materialsByHomeworkId = new Map<string, LearningMaterialItem[]>();

    for (const material of materials.filter((item) => item.homework_id && homeworkIds.has(item.homework_id))) {
      const existing = materialsByHomeworkId.get(material.homework_id ?? "") ?? [];
      existing.push({
        content: material.content ?? "",
        detail: materialTypeLabel(material.type),
        id: material.id,
        title: material.title,
        url: material.url,
      });
      materialsByHomeworkId.set(material.homework_id ?? "", existing);
    }

    return {
      groups: visibleGroups.map((group) => `${group.name} - ${courseMap.get(group.course_id)?.name ?? "курс"}`),
      homework: homework.map((item) => {
        const group = item.group_id ? groupMap.get(item.group_id) : null;
        const lesson = item.lesson_id ? lessonMap.get(item.lesson_id) : null;

        return {
          context: group ? `${group.name} - ${courseMap.get(group.course_id)?.name ?? "курс"}` : courseMap.get(item.course_id)?.name ?? "курс",
          description: item.description ?? "Описание не заполнено",
          due: formatDate(item.due_at),
          id: item.id,
          lesson: lesson
            ? `${formatDateTime(lesson.starts_at)} - ${lesson.topic ?? courseMap.get(lesson.course_id)?.name ?? "урок"}`
            : "без связи с уроком",
          materials: materialsByHomeworkId.get(item.id) ?? [],
          title: item.title,
        };
      }),
      metrics: [
        { label: "Задания", value: String(homework.length) },
        { label: "Индивидуальные", value: String(homework.filter((item) => item.student_id === student.id).length) },
        { label: "С материалами", value: String(homework.filter((item) => (materialsByHomeworkId.get(item.id) ?? []).length > 0).length) },
      ],
      studentName: student.name,
    };
  });
}

export async function getStudentMaterials(organizationId: string, email: string) {
  return readSupabaseData<StudentMaterialsData>(async (client) => {
    const user = await getUserByEmail(client, email);
    const studentResult = await client
      .from("students")
      .select("id,user_id,name,phone,email,status")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .maybeSingle();
    const student = single<StudentRow>(studentResult, "Карточка ученика");
    const { courses, groups } = await getBaseOrganizationData(client, organizationId);
    const groupStudentsResult = await client
      .from("group_students")
      .select("id,group_id,student_id,status")
      .eq("student_id", student.id);
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Группы ученика");
    const visibleGroups = activeWorkspaceGroups(groups, groupStudents);
    const activeGroupIds = new Set(visibleGroups.map((group) => group.id));
    const courseIds = new Set(visibleGroups.map((group) => group.course_id));
    const [lessonsResult, homeworkResult, materialsResult] = await Promise.all([
      activeGroupIds.size > 0
        ? client
            .from("lessons")
            .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
            .eq("organization_id", organizationId)
            .in("group_id", [...activeGroupIds])
            .order("starts_at", { ascending: false })
            .limit(80)
        : Promise.resolve({ data: [], error: null }),
      client
        .from("homework")
        .select("id,course_id,group_id,student_id,lesson_id,title,description,due_at,status")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .limit(100),
      client
        .from("materials")
        .select("id,course_id,group_id,student_id,lesson_id,homework_id,title,type,content,url,visibility,status")
        .eq("organization_id", organizationId)
        .eq("visibility", "visible_to_students")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    const lessons = rows<LessonRow>(lessonsResult, "Уроки материалов ученика");
    const homework = rows<HomeworkRow>(homeworkResult, "Домашние задания материалов ученика").filter(
      (item) => item.student_id === student.id || (item.group_id ? activeGroupIds.has(item.group_id) : false),
    );
    const materials = rows<MaterialRow>(materialsResult, "Открытые материалы ученика");
    const lessonIds = new Set(lessons.map((lesson) => lesson.id));
    const homeworkIds = new Set(homework.map((item) => item.id));
    const lessonMap = byId(lessons);
    const homeworkMap = byId(homework);
    const groupMap = byId(visibleGroups);
    const courseMap = byId(courses);
    const visibleMaterials = materials.filter((item) => {
      if (item.homework_id && !homeworkIds.has(item.homework_id)) {
        return false;
      }

      return (
        item.student_id === student.id ||
        (item.group_id ? activeGroupIds.has(item.group_id) : false) ||
        (item.course_id ? courseIds.has(item.course_id) && !item.group_id && !item.student_id : false) ||
        (item.lesson_id ? lessonIds.has(item.lesson_id) : false) ||
        (item.homework_id ? homeworkIds.has(item.homework_id) : false)
      );
    });

    function materialContext(item: MaterialRow) {
      if (item.homework_id && homeworkMap.has(item.homework_id)) {
        return `ДЗ: ${homeworkMap.get(item.homework_id)?.title}`;
      }

      if (item.lesson_id && lessonMap.has(item.lesson_id)) {
        const lesson = lessonMap.get(item.lesson_id);
        return `Урок: ${formatDateTime(lesson?.starts_at)} - ${lesson?.topic ?? courseMap.get(lesson?.course_id ?? "")?.name ?? "курс"}`;
      }

      if (item.group_id && groupMap.has(item.group_id)) {
        return `Группа: ${groupMap.get(item.group_id)?.name}`;
      }

      if (item.course_id && courseMap.has(item.course_id)) {
        return `Курс: ${courseMap.get(item.course_id)?.name}`;
      }

      return "личный материал";
    }

    return {
      groups: visibleGroups.map((group) => `${group.name} - ${courseMap.get(group.course_id)?.name ?? "курс"}`),
      materials: visibleMaterials.map((item) => ({
        content: item.content ?? "",
        detail: `${materialTypeLabel(item.type)}; ${materialContext(item)}`,
        id: item.id,
        title: item.title,
        url: item.url,
      })),
      metrics: [
        { label: "Материалы", value: String(visibleMaterials.length) },
        { label: "Ссылки", value: String(visibleMaterials.filter((item) => item.type === "link").length) },
        { label: "Тексты", value: String(visibleMaterials.filter((item) => item.type === "text").length) },
      ],
      studentName: student.name,
    };
  });
}

export async function getStudentOverview(organizationId: string, email: string) {
  return readSupabaseData<StudentOverviewData>(async (client) => {
    const user = await getUserByEmail(client, email);
    const studentResult = await client
      .from("students")
      .select("id,user_id,name,phone,email,status")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .maybeSingle();
    const student = single<StudentRow>(studentResult, "Карточка ученика");
    const { courses, groups, users } = await getBaseOrganizationData(client, organizationId);
    const groupStudentsResult = await client
      .from("group_students")
      .select("id,group_id,student_id,status")
      .eq("student_id", student.id);
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Группы ученика");
    const visibleGroups = activeWorkspaceGroups(groups, groupStudents);
    const activeGroupIds = new Set(visibleGroups.map((group) => group.id));
    const courseIds = new Set(visibleGroups.map((group) => group.course_id));
    const courseMap = byId(courses);
    const groupMap = byId(visibleGroups);
    const userMap = byId(users);
    const [lessonsResult, scheduleRulesResult, homeworkResult, materialsResult, progressResult, recordsResult, paymentsResult] = await Promise.all([
      activeGroupIds.size > 0
        ? client
            .from("lessons")
            .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
            .eq("organization_id", organizationId)
            .in("group_id", [...activeGroupIds])
            .gte("starts_at", new Date().toISOString())
            .order("starts_at", { ascending: true })
            .limit(6)
        : Promise.resolve({ data: [], error: null }),
      activeGroupIds.size > 0
        ? client
            .from("schedule_rules")
            .select("id,target_type,target_id,weekday,start_time,end_time,starts_on,ends_on,status")
            .eq("organization_id", organizationId)
            .eq("target_type", "group")
            .in("target_id", [...activeGroupIds])
            .eq("status", "active")
            .order("weekday", { ascending: true })
            .order("start_time", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      client
        .from("homework")
        .select("id,course_id,group_id,student_id,lesson_id,title,description,due_at,status")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .order("due_at", { ascending: true, nullsFirst: false })
        .limit(20),
      client
        .from("materials")
        .select("id,course_id,group_id,student_id,lesson_id,homework_id,title,type,content,url,visibility,status")
        .eq("organization_id", organizationId)
        .eq("visibility", "visible_to_students")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20),
      courseIds.size > 0
        ? client
            .from("student_progress_rules")
            .select("id,student_id,course_id,name,level,note,is_visible_to_student,is_active")
            .eq("organization_id", organizationId)
            .eq("student_id", student.id)
            .eq("is_visible_to_student", true)
            .eq("is_active", true)
            .in("course_id", [...courseIds])
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      courseIds.size > 0
        ? client
            .from("progress_records")
            .select("id,student_id,course_id,lesson_id,repeat_note,student_comment,internal_comment,is_visible_to_student,created_at")
            .eq("organization_id", organizationId)
            .eq("student_id", student.id)
            .eq("is_visible_to_student", true)
            .in("course_id", [...courseIds])
            .order("created_at", { ascending: false })
            .limit(3)
        : Promise.resolve({ data: [], error: null }),
      client
        .from("payments")
        .select("id,student_id,course_id,group_id,amount,currency,period_start,period_end,due_at,status")
        .eq("student_id", student.id)
        .order("due_at", { ascending: true, nullsFirst: false }),
    ]);
    const lessons = rows<LessonRow>(lessonsResult, "Ближайшие занятия ученика");
    const scheduleRules = rows<ScheduleRuleRow>(scheduleRulesResult, "Правила расписания ученика");
    const lessonIds = new Set(lessons.map((lesson) => lesson.id));
    const homework = rows<HomeworkRow>(homeworkResult, "Домашние задания ученика").filter(
      (item) =>
        item.student_id === student.id ||
        (item.group_id ? activeGroupIds.has(item.group_id) : false) ||
        (item.lesson_id ? lessonIds.has(item.lesson_id) : false),
    );
    const homeworkIds = new Set(homework.map((item) => item.id));
    const materials = rows<MaterialRow>(materialsResult, "Материалы ученика").filter((item) => {
      if (item.homework_id && !homeworkIds.has(item.homework_id)) {
        return false;
      }

      return (
        item.student_id === student.id ||
        (item.group_id ? activeGroupIds.has(item.group_id) : false) ||
        (item.course_id ? courseIds.has(item.course_id) && !item.group_id && !item.student_id : false) ||
        (item.lesson_id ? lessonIds.has(item.lesson_id) : false) ||
        (item.homework_id ? homeworkIds.has(item.homework_id) : false)
      );
    });
    const progress = rows<ProgressRuleRow>(progressResult, "Прогресс ученика");
    const progressRecords = rows<ProgressRecordRow>(recordsResult, "Записи прогресса ученика");
    const payments = rows<PaymentRow>(paymentsResult, "Оплата ученика");
    const studentLessons = summarizeStudentScheduleLessons(lessons, scheduleRules, courseMap, groupMap, userMap, 8);
    const visibleHomework = homework.slice(0, 3).map((item) => {
      const group = item.group_id ? groupMap.get(item.group_id) : null;

      return {
        context: group ? `${group.name} - ${courseMap.get(group.course_id)?.name ?? "курс"}` : courseMap.get(item.course_id)?.name ?? "курс",
        description: item.description ?? "Описание не заполнено",
        due: formatDate(item.due_at),
        id: item.id,
        lesson: "подробности в разделе домашних заданий",
        materials: [],
        title: item.title,
      };
    });
    const progressSummary = [
      ...progress.slice(0, 3).map((item) => `${item.name}${item.level ? ` - ${progressLevelLabel(item.level)}` : ""}`),
      ...progressRecords
        .slice(0, Math.max(0, 3 - progress.length))
        .map((item) => item.repeat_note || item.student_comment || "Есть открытая запись прогресса"),
    ];

    return {
      courses: [...courseIds].map((courseId) => courseMap.get(courseId)?.name ?? "Курс"),
      groups: visibleGroups.map((group) => `${group.name} - ${courseMap.get(group.course_id)?.name ?? "курс"}`),
      homework: visibleHomework,
      materials: materials.slice(0, 3).map((item) => ({
        content: item.content ?? "",
        detail: materialTypeLabel(item.type),
        id: item.id,
        title: item.title,
        url: item.url,
      })),
      nextLesson: studentLessons[0] ?? null,
      payments: summarizePayments(payments, new Map([[student.id, student]]), courseMap, groupMap),
      progress: progressSummary,
      studentName: student.name,
    };
  });
}

export async function getStudentSchedule(organizationId: string, email: string) {
  return readSupabaseData<StudentScheduleData>(async (client) => {
    const user = await getUserByEmail(client, email);
    const studentResult = await client
      .from("students")
      .select("id,user_id,name,phone,email,status")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .maybeSingle();
    const student = single<StudentRow>(studentResult, "Карточка ученика");
    const { courses, groups, users } = await getBaseOrganizationData(client, organizationId);
    const groupStudentsResult = await client
      .from("group_students")
      .select("id,group_id,student_id,status")
      .eq("student_id", student.id);
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Группы расписания ученика");
    const visibleGroups = activeWorkspaceGroups(groups, groupStudents);
    const activeGroupIds = new Set(visibleGroups.map((group) => group.id));
    const [lessonsResult, scheduleRulesResult] =
      activeGroupIds.size > 0
        ? await Promise.all([
            client
              .from("lessons")
              .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
              .eq("organization_id", organizationId)
              .in("group_id", [...activeGroupIds])
              .gte("starts_at", new Date().toISOString())
              .order("starts_at", { ascending: true })
              .limit(20),
            client
              .from("schedule_rules")
              .select("id,target_type,target_id,weekday,start_time,end_time,starts_on,ends_on,status")
              .eq("organization_id", organizationId)
              .eq("target_type", "group")
              .in("target_id", [...activeGroupIds])
              .eq("status", "active")
              .order("weekday", { ascending: true })
              .order("start_time", { ascending: true }),
          ])
        : [
            { data: [], error: null },
            { data: [], error: null },
          ];
    const lessons = rows<LessonRow>(lessonsResult, "Расписание ученика");
    const scheduleRules = rows<ScheduleRuleRow>(scheduleRulesResult, "Правила расписания ученика");
    const courseMap = byId(courses);
    const groupMap = byId(visibleGroups);
    const userMap = byId(users);
    const courseIds = new Set(visibleGroups.map((group) => group.course_id));
    const scheduleLessons = summarizeStudentScheduleLessons(lessons, scheduleRules, courseMap, groupMap, userMap, 12);

    return {
      groups: visibleGroups.map((group) => `${group.name} - ${courseMap.get(group.course_id)?.name ?? "курс"}`),
      lessons: scheduleLessons,
      metrics: [
        { label: "Ближайшие занятия", value: String(scheduleLessons.length) },
        { label: "Группы", value: String(visibleGroups.length) },
        { label: "Курсы", value: String(courseIds.size) },
      ],
      studentName: student.name,
    };
  });
}

export async function getStudentAttendance(organizationId: string, email: string) {
  return readSupabaseData<StudentAttendanceData>(async (client) => {
    const user = await getUserByEmail(client, email);
    const studentResult = await client
      .from("students")
      .select("id,user_id,name,phone,email,status")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .maybeSingle();
    const student = single<StudentRow>(studentResult, "Карточка ученика");
    const { courses, groups } = await getBaseOrganizationData(client, organizationId);
    const groupStudentsResult = await client
      .from("group_students")
      .select("id,group_id,student_id,status")
      .eq("student_id", student.id);
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Группы посещаемости ученика");
    const visibleGroups = activeWorkspaceGroups(groups, groupStudents);
    const activeGroupIds = new Set(visibleGroups.map((group) => group.id));
    const lessonsResult =
      activeGroupIds.size > 0
        ? await client
            .from("lessons")
            .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
            .eq("organization_id", organizationId)
            .in("group_id", [...activeGroupIds])
            .lte("starts_at", new Date().toISOString())
            .order("starts_at", { ascending: false })
            .limit(40)
        : { data: [], error: null };
    const lessons = rows<LessonRow>(lessonsResult, "Посещаемость ученика");
    const lessonIds = lessons.map((lesson) => lesson.id);
    const journalResult =
      lessonIds.length > 0
        ? await client
            .from("journal_entries")
            .select("id,lesson_id,student_id,attendance_mark,lesson_mark,teacher_comment,internal_comment,is_visible_to_student")
            .eq("student_id", student.id)
            .in("lesson_id", lessonIds)
        : { data: [], error: null };
    const journalEntries = rows<JournalEntryRow>(journalResult, "Записи посещаемости ученика").filter(
      (entry) => entry.student_id === student.id,
    );
    const journalByLessonId = new Map(journalEntries.map((entry) => [entry.lesson_id, entry]));
    const courseMap = byId(courses);
    const groupMap = byId(visibleGroups);
    const attendance = lessons.map((lesson) => {
      const entry = journalByLessonId.get(lesson.id);
      const status = studentAttendanceStatus(lesson, entry);
      const group = lesson.group_id ? groupMap.get(lesson.group_id) : null;

      return {
        course: courseMap.get(lesson.course_id)?.name ?? "Курс",
        date: formatDateLong(lesson.starts_at),
        group: group?.name ?? "индивидуальное занятие",
        id: lesson.id,
        lesson: lesson.topic ?? courseMap.get(lesson.course_id)?.name ?? "Занятие",
        mark: status.label,
        status: status.status,
        teacherComment: entry?.is_visible_to_student ? entry.teacher_comment ?? "" : "",
        timeRange: `${formatTimeOfDate(lesson.starts_at)}-${formatTimeOfDate(lesson.ends_at)}`,
      };
    });
    const recordedAttendance = attendance.filter((item) => item.status !== "unknown");
    const absentCount = recordedAttendance.filter((item) => item.status === "absent").length;
    const excusedCount = recordedAttendance.filter((item) => item.status === "excused").length;

    return {
      attendance: recordedAttendance,
      groups: visibleGroups.map((group) => `${group.name} - ${courseMap.get(group.course_id)?.name ?? "курс"}`),
      metrics: [
        { label: "Отмечено", value: String(recordedAttendance.length), detail: lessons.length > recordedAttendance.length ? "неотмеченные уроки скрыты" : undefined },
        { label: "Присутствовал", value: String(recordedAttendance.filter((item) => item.status === "present").length) },
        {
          label: "Пропуски",
          value: String(absentCount + excusedCount),
          detail: excusedCount > 0 ? `${absentCount} без причины, ${excusedCount} уважит.` : undefined,
        },
      ],
      studentName: student.name,
    };
  });
}

export async function getStudentProgress(organizationId: string, email: string) {
  return readSupabaseData<StudentProgressData>(async (client) => {
    const user = await getUserByEmail(client, email);
    const studentResult = await client
      .from("students")
      .select("id,user_id,name,phone,email,status")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .maybeSingle();
    const student = single<StudentRow>(studentResult, "Карточка ученика");
    const { courses, groups } = await getBaseOrganizationData(client, organizationId);
    const groupStudentsResult = await client
      .from("group_students")
      .select("id,group_id,student_id,status")
      .eq("student_id", student.id);
    const groupStudents = rows<GroupStudentRow>(groupStudentsResult, "Группы ученика");
    const visibleGroups = activeWorkspaceGroups(groups, groupStudents);
    const activeGroupIds = new Set(visibleGroups.map((group) => group.id));
    const courseIds = new Set(visibleGroups.map((group) => group.course_id));
    const courseIdList = [...courseIds];
    const [rulesResult, errorsResult, recordsResult, lessonsResult] = await Promise.all([
      courseIdList.length > 0
        ? client
            .from("student_progress_rules")
            .select("id,student_id,course_id,name,level,note,is_visible_to_student,is_active")
            .eq("organization_id", organizationId)
            .eq("student_id", student.id)
            .eq("is_visible_to_student", true)
            .eq("is_active", true)
            .in("course_id", courseIdList)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      courseIdList.length > 0
        ? client
            .from("student_progress_errors")
            .select("id,student_id,course_id,name,note,is_visible_to_student,is_active")
            .eq("organization_id", organizationId)
            .eq("student_id", student.id)
            .eq("is_visible_to_student", true)
            .eq("is_active", true)
            .in("course_id", courseIdList)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      courseIdList.length > 0
        ? client
            .from("progress_records")
            .select("id,student_id,course_id,lesson_id,repeat_note,student_comment,internal_comment,is_visible_to_student,created_at")
            .eq("organization_id", organizationId)
            .eq("student_id", student.id)
            .eq("is_visible_to_student", true)
            .in("course_id", courseIdList)
            .order("created_at", { ascending: false })
            .limit(12)
        : Promise.resolve({ data: [], error: null }),
      activeGroupIds.size > 0
        ? client
            .from("lessons")
            .select("id,course_id,group_id,teacher_id,starts_at,ends_at,topic")
            .in("group_id", [...activeGroupIds])
            .order("starts_at", { ascending: false })
            .limit(20)
        : Promise.resolve({ data: [], error: null }),
    ]);
    const rules = rows<ProgressRuleRow>(rulesResult, "Открытые правила прогресса");
    const errors = rows<ProgressErrorRow>(errorsResult, "Открытые ошибки прогресса");
    const records = rows<ProgressRecordRow>(recordsResult, "Открытые записи прогресса");
    const lessons = rows<LessonRow>(lessonsResult, "Уроки прогресса ученика");
    const courseMap = byId(courses);
    const lessonMap = byId(lessons);

    return {
      errors: errors.map((item) => ({
        course: courseMap.get(item.course_id)?.name ?? "Курс",
        courseId: item.course_id,
        id: item.id,
        isActive: item.is_active,
        isVisibleToStudent: item.is_visible_to_student,
        name: item.name,
        note: item.note ?? "",
      })),
      groups: visibleGroups.map((group) => `${group.name} - ${courseMap.get(group.course_id)?.name ?? "курс"}`),
      records: records.map((item) => {
        const lesson = item.lesson_id ? lessonMap.get(item.lesson_id) : null;

        return {
          course: courseMap.get(item.course_id)?.name ?? "Курс",
          courseId: item.course_id,
          createdAt: formatDateTime(item.created_at),
          id: item.id,
          internalComment: "",
          isVisibleToStudent: item.is_visible_to_student,
          lesson: lesson
            ? `${formatDateTime(lesson.starts_at)} - ${lesson.topic ?? courseMap.get(lesson.course_id)?.name ?? "урок"}`
            : "без связи с уроком",
          lessonId: item.lesson_id,
          repeatNote: item.repeat_note ?? "",
          studentComment: item.student_comment ?? "",
        };
      }),
      rules: rules.map((item) => ({
        course: courseMap.get(item.course_id)?.name ?? "Курс",
        courseId: item.course_id,
        id: item.id,
        isActive: item.is_active,
        isVisibleToStudent: item.is_visible_to_student,
        level: progressLevelLabel(item.level),
        levelValue: item.level ?? "",
        name: item.name,
        note: item.note ?? "",
      })),
      studentName: student.name,
    };
  });
}
