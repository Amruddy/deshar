import Link from "next/link";
import { DataTable, SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getTeacherAttendance } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";

type TeacherAttendancePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function searchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function searchBoolean(value: string | string[] | undefined) {
  const raw = searchValue(value);

  return raw === "1" || raw === "true" || raw === "on";
}

function attendanceHref(
  month: string,
  filters: {
    groupId: string;
    lowOnly: boolean;
    onlyAbsences: boolean;
  },
) {
  const params = new URLSearchParams({ month });

  if (filters.groupId) {
    params.set("groupId", filters.groupId);
  }

  if (filters.onlyAbsences) {
    params.set("onlyAbsences", "1");
  }

  if (filters.lowOnly) {
    params.set("lowOnly", "1");
  }

  return `/teacher/attendance?${params.toString()}`;
}

export default async function TeacherAttendancePage({ searchParams }: TeacherAttendancePageProps) {
  const session = await requireWorkspace("teacher");
  const params = searchParams ? await searchParams : {};
  const result = await getTeacherAttendance(session.organizationId, session.userId, {
    groupId: searchValue(params.groupId),
    lowOnly: searchBoolean(params.lowOnly),
    month: searchValue(params.month),
    onlyAbsences: searchBoolean(params.onlyAbsences),
  });

  return (
    <SupabaseDataPage
      title="Посещаемость"
      description="Сводка по ученикам из групп преподавателя: процент, уроки, пропуски и переходы в журнал."
      result={result}
    >
      {(data) => (
        <>
          <section className="panel section payment-list-panel" data-attendance-summary="ready">
            <div className="section-heading payment-list-heading">
              <div>
                <h2>Сводная посещаемость</h2>
                <p>
                  {data.monthLabel}; низкая посещаемость считается ниже {data.lowThreshold}.
                </p>
              </div>
              <div className="button-row payment-list-actions">
                <Link
                  className="secondary-button compact-button"
                  href={attendanceHref(data.previousMonth, data.activeFilters)}
                >
                  Предыдущий месяц
                </Link>
                <Link className="secondary-button compact-button" href={attendanceHref(data.nextMonth, data.activeFilters)}>
                  Следующий месяц
                </Link>
                <details className="payment-filter-disclosure">
                  <summary className="secondary-button compact-button">Фильтры</summary>
                  <div className="payment-filter-popover">
                    <form className="form-grid payment-filter-form" method="get">
                      <label>
                        Месяц
                        <input defaultValue={data.activeFilters.month} name="month" type="month" />
                      </label>
                      <label>
                        Группа
                        <select defaultValue={data.activeFilters.groupId} name="groupId">
                          <option value="">Все группы</option>
                          {data.groupOptions.map((group) => (
                            <option key={group.value} value={group.value}>
                              {group.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="checkbox-label">
                        <input
                          defaultChecked={data.activeFilters.onlyAbsences}
                          name="onlyAbsences"
                          type="checkbox"
                          value="1"
                        />
                        Только с пропусками
                      </label>
                      <label className="checkbox-label">
                        <input defaultChecked={data.activeFilters.lowOnly} name="lowOnly" type="checkbox" value="1" />
                        Только ниже порога
                      </label>
                      <div className="button-row payment-filter-actions">
                        <button className="button" type="submit">
                          Показать
                        </button>
                        <Link className="secondary-button" href="/teacher/attendance">
                          Сбросить
                        </Link>
                      </div>
                    </form>
                  </div>
                </details>
              </div>
            </div>

            <DataTable
              rows={data.rows}
              keyForRow={(row) => row.id}
              emptyText="По выбранным фильтрам нет данных посещаемости."
              columns={[
                {
                  header: "Ученик",
                  render: (row) => (
                    <Link className="table-link" href={row.studentHref}>
                      <strong>{row.name}</strong>
                    </Link>
                  ),
                },
                {
                  header: "Группа",
                  render: (row) => (
                    <div className="payment-cell">
                      <Link className="table-link" href={row.journalHref}>
                        <strong>{row.context}</strong>
                      </Link>
                      <p>{row.contacts}</p>
                    </div>
                  ),
                },
                {
                  header: "Процент",
                  render: (row) => (
                    <span className="payment-status-pill" data-tone={row.statusTone}>
                      {row.percent}
                    </span>
                  ),
                },
                {
                  header: "Уроки",
                  render: (row) => (
                    <div className="payment-cell">
                      <strong>{row.lessons}</strong>
                      <p>присутствий: {row.present}</p>
                    </div>
                  ),
                },
                {
                  header: "Пропуски",
                  render: (row) => (
                    <div className="payment-cell">
                      <strong>Н: {row.absent}</strong>
                      <p>У: {row.excused}</p>
                    </div>
                  ),
                },
                {
                  header: "Последний урок",
                  render: (row) =>
                    row.lastLessonHref ? (
                      <Link className="table-link" href={row.lastLessonHref}>
                        {row.lastLesson}
                      </Link>
                    ) : (
                      row.lastLesson
                    ),
                },
                {
                  header: "Статус",
                  render: (row) => (
                    <span className="payment-status-pill" data-tone={row.statusTone}>
                      {row.status}
                    </span>
                  ),
                },
                {
                  header: "Действия",
                  render: (row) => (
                    <div className="button-row">
                      <Link className="button compact-button" href={row.journalHref}>
                        Журнал
                      </Link>
                      <Link className="secondary-button compact-button" href={row.studentHref}>
                        Ученик
                      </Link>
                    </div>
                  ),
                },
              ]}
            />
          </section>
        </>
      )}
    </SupabaseDataPage>
  );
}
