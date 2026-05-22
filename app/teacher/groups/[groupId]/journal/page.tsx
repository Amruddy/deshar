import Link from "next/link";
import { SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getTeacherGroupJournal } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";
import { saveGroupJournal } from "@/app/teacher/actions";

type TeacherGroupJournalPageProps = {
  params: Promise<{
    groupId: string;
  }>;
  searchParams?: Promise<{
    month?: string | string[];
  }>;
};

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TeacherGroupJournalPage({ params, searchParams }: TeacherGroupJournalPageProps) {
  const session = await requireWorkspace("teacher");
  const { groupId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const month = firstSearchValue(resolvedSearchParams?.month);
  const result = await getTeacherGroupJournal(session.organizationId, session.email, groupId, month);

  return (
    <SupabaseDataPage
      title="Журнал группы"
      description="Календарный журнал месяца: только реальные уроки группы, ученики и быстрые отметки посещаемости."
      result={result}
    >
      {(data) => {
        const saveJournal = saveGroupJournal.bind(null, data.id);

        return (
          <>
            <section className="teacher-overview-grid">
              <div className="panel teacher-main-panel">
                <div className="section-heading">
                  <div>
                    <h2>{data.name}</h2>
                    <p>
                      {data.course}; {data.teacher}; {data.status}
                    </p>
                  </div>
                  <Link className="secondary-button compact-button" href={`/teacher/groups/${data.id}`}>
                    К группе
                  </Link>
                </div>

                <div className="teacher-highlight">
                  <span>Выбранный месяц</span>
                  <strong>{data.monthLabel}</strong>
                  <p>
                    Уроков: {data.lessons.length}; учеников: {data.students.length}; сохраненных записей:{" "}
                    {data.savedEntries}
                  </p>
                  <div className="button-row">
                    <Link
                      className="secondary-button compact-button"
                      href={`/teacher/groups/${data.id}/journal?month=${data.previousMonth}`}
                    >
                      Предыдущий месяц
                    </Link>
                    <Link
                      className="secondary-button compact-button"
                      href={`/teacher/groups/${data.id}/journal?month=${data.nextMonth}`}
                    >
                      Следующий месяц
                    </Link>
                  </div>
                </div>
              </div>

              <aside className="panel teacher-side-panel">
                <h2>Обозначения</h2>
                <div className="journal-legend">
                  <span>П - присутствовал</span>
                  <span>Н - отсутствовал</span>
                  <span>У - уважительная причина</span>
                  <span>Пусто после сохраненного прошедшего урока считается присутствием.</span>
                </div>
              </aside>
            </section>

            <section className="journal-sheet section">
              <div className="section-heading">
                <div>
                  <h2>Таблица месяца</h2>
                  <p>{data.monthLabel}</p>
                </div>
              </div>

              {data.lessons.length === 0 ? (
                <p className="empty-state">В выбранном месяце у группы нет созданных уроков.</p>
              ) : data.students.length === 0 ? (
                <p className="empty-state">В группе пока нет активных учеников для журнала.</p>
              ) : (
                <form action={saveJournal} className="journal-form">
                  <input name="month" type="hidden" value={data.monthValue} />
                  <div className="journal-table-wrap">
                    <table className="journal-table">
                      <thead>
                        <tr>
                          <th className="journal-student-head">Ученик</th>
                          {data.lessons.map((lesson) => (
                            <th className={lesson.isWeekStart ? "week-start" : undefined} key={lesson.id}>
                              <Link className="journal-lesson-link" href={`/teacher/lessons/${lesson.id}`}>
                                <span>{lesson.weekday}</span>
                                <strong>{lesson.day}</strong>
                                <em>{lesson.timeRange}</em>
                              </Link>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.students.map((student) => (
                          <tr key={student.id}>
                            <th className="journal-student-name" scope="row">
                              {student.name}
                            </th>
                            {data.lessons.map((lesson, lessonIndex) => {
                              const cell = student.cells[lessonIndex];
                              const selectId = `attendance-${lesson.id}-${student.id}`;

                              return (
                                <td
                                  className={lesson.isWeekStart ? "week-start" : undefined}
                                  data-attendance={cell.attendanceTone}
                                  data-label={`${lesson.weekday} ${lesson.day}, ${lesson.timeRange}`}
                                  data-future={cell.isFuture ? "true" : undefined}
                                  key={cell.id}
                                >
                                  <div className="journal-cell">
                                    <label className="visually-hidden" htmlFor={selectId}>
                                      {student.name}, {lesson.day}
                                    </label>
                                    <select
                                      aria-label={`${student.name}, ${lesson.day}`}
                                      className="journal-cell-input"
                                      defaultValue={cell.attendanceMark}
                                      id={selectId}
                                      name={`attendance__${cell.lessonId}__${cell.studentId}`}
                                    >
                                      <option value="">-</option>
                                      <option value="present">П</option>
                                      <option value="absent">Н</option>
                                      <option value="excused">У</option>
                                    </select>
                                    {cell.indicators.length > 0 ? (
                                      <div className="journal-cell-meta">
                                        {cell.indicators.map((indicator) => (
                                          <span key={indicator}>{indicator}</span>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="journal-meta">
                    <button className="button compact-button" type="submit">
                      Сохранить журнал
                    </button>
                    <p>Сохраняются только быстрые отметки посещаемости. Детали урока появятся на странице урока.</p>
                  </div>
                </form>
              )}
            </section>
          </>
        );
      }}
    </SupabaseDataPage>
  );
}
