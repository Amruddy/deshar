import Link from "next/link";
import { InfoList, SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getTeacherLessonDetail } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";
import { createLessonHomework, createLessonMaterial, saveLessonDetails, saveLessonJournal } from "@/app/teacher/actions";

type TeacherLessonPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

const ATTENDANCE_OPTIONS = [
  { label: "-", value: "" },
  { label: "П", value: "present" },
  { label: "Н", value: "absent" },
  { label: "У", value: "excused" },
];

export default async function TeacherLessonPage({ params }: TeacherLessonPageProps) {
  const session = await requireWorkspace("teacher");
  const { lessonId } = await params;
  const result = await getTeacherLessonDetail(session.organizationId, session.email, lessonId);

  return (
    <SupabaseDataPage
      title="Урок"
      description="Подробная рабочая страница занятия: тема, учебная запись, посещаемость, оценки, домашнее задание и материалы."
      result={result}
    >
      {(data) => {
        const addHomework = createLessonHomework.bind(null, data.id);
        const addMaterial = createLessonMaterial.bind(null, data.id);
        const saveDetails = saveLessonDetails.bind(null, data.id);
        const saveJournal = saveLessonJournal.bind(null, data.id);

        return (
          <>
            <section className="teacher-overview-grid">
              <div className="panel teacher-main-panel">
                <div className="section-heading">
                  <div>
                    <h2>{data.topic || data.course}</h2>
                    <p>
                      {data.course}; {data.group}; {data.teacher}
                    </p>
                  </div>
                  <Link className="secondary-button compact-button" href={data.groupHref}>
                    К группе
                  </Link>
                </div>

                <div className="teacher-highlight">
                  <span>{data.startsAtLabel}</span>
                  <strong>{data.timeRange}</strong>
                  <p>
                    Записей журнала: {data.savedEntries}; шкала оценки: {data.lessonMarkScale}.
                  </p>
                  <div className="button-row">
                    <Link className="secondary-button compact-button" href={data.journalHref}>
                      Журнал
                    </Link>
                  </div>
                </div>
              </div>

              <aside className="panel teacher-side-panel">
                <h2>Контекст</h2>
                <InfoList
                  emptyText="Контекст урока не найден."
                  items={[
                    <div className="info-row" key="course">
                      <span>Курс</span>
                      <strong>{data.course}</strong>
                    </div>,
                    <div className="info-row" key="group">
                      <span>Группа</span>
                      <Link href={data.groupHref}>{data.group}</Link>
                    </div>,
                    <div className="info-row" key="teacher">
                      <span>Преподаватель</span>
                      <strong>{data.teacher}</strong>
                    </div>,
                  ]}
                />
              </aside>
            </section>

            <section className="panel section">
              <div className="section-heading">
                <div>
                  <h2>Учебная запись</h2>
                  <p>Тема и общий комментарий урока.</p>
                </div>
              </div>

              <form action={saveDetails} className="form-grid">
                <label>
                  Тема урока
                  <input name="topic" defaultValue={data.topic} />
                </label>
                <label className="full-width-field">
                  Комментарий урока
                  <textarea name="summary" defaultValue={data.summary} />
                </label>
                <button className="button compact-button" type="submit">
                  Сохранить урок
                </button>
              </form>
            </section>

            <section className="journal-sheet section">
              <div className="section-heading">
                <div>
                  <h2>Ученики и журнал урока</h2>
                  <p>Посещаемость, оценка за урок и комментарии по каждому ученику.</p>
                </div>
              </div>

              {data.students.length === 0 ? (
                <p className="empty-state">В группе пока нет активных учеников для этого урока.</p>
              ) : (
                <form action={saveJournal} className="journal-form">
                  <div className="journal-table-wrap">
                    <table className="journal-table lesson-journal-table">
                      <thead>
                        <tr>
                          <th className="lesson-journal-student-head">Ученик</th>
                          <th>Посещаемость</th>
                          {data.lessonMarkOptions.length > 0 ? <th>Оценка</th> : null}
                          <th>Комментарий ученику</th>
                          <th>Внутренний комментарий</th>
                          <th>Видимость</th>
                          <th>Прогресс</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.students.map((student) => (
                          <tr key={student.id}>
                            <th className="lesson-journal-student-name" scope="row">
                              <Link href={student.progressHref}>{student.name}</Link>
                              <span>{student.contacts}</span>
                            </th>
                            <td>
                              <label className="visually-hidden" htmlFor={`attendance-${student.id}`}>
                                Посещаемость: {student.name}
                              </label>
                              <select
                                className="lesson-journal-control"
                                defaultValue={student.journalEntry.attendanceMark}
                                id={`attendance-${student.id}`}
                                name={`attendance__${student.id}`}
                              >
                                {ATTENDANCE_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            {data.lessonMarkOptions.length > 0 ? (
                              <td>
                                <label className="visually-hidden" htmlFor={`lesson-mark-${student.id}`}>
                                  Оценка: {student.name}
                                </label>
                                <select
                                  className="lesson-journal-control"
                                  defaultValue={student.journalEntry.lessonMark}
                                  id={`lesson-mark-${student.id}`}
                                  name={`lesson_mark__${student.id}`}
                                >
                                  <option value="">без оценки</option>
                                  {data.lessonMarkOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            ) : null}
                            <td>
                              <label className="visually-hidden" htmlFor={`teacher-comment-${student.id}`}>
                                Комментарий ученику: {student.name}
                              </label>
                              <textarea
                                className="lesson-journal-textarea"
                                defaultValue={student.journalEntry.teacherComment}
                                id={`teacher-comment-${student.id}`}
                                name={`teacher_comment__${student.id}`}
                              />
                            </td>
                            <td>
                              <label className="visually-hidden" htmlFor={`internal-comment-${student.id}`}>
                                Внутренний комментарий: {student.name}
                              </label>
                              <textarea
                                className="lesson-journal-textarea"
                                defaultValue={student.journalEntry.internalComment}
                                id={`internal-comment-${student.id}`}
                                name={`internal_comment__${student.id}`}
                              />
                            </td>
                            <td>
                              <label className="checkbox-label lesson-visible-checkbox">
                                <input
                                  defaultChecked={student.journalEntry.isVisibleToStudent}
                                  name={`visible__${student.id}`}
                                  type="checkbox"
                                  value="true"
                                />
                                Видно ученику
                              </label>
                            </td>
                            <td>
                              <div className="lesson-progress-cell">
                                <span>{student.hasProgressRecord ? "Есть запись" : "Нет записи"}</span>
                                <Link className="secondary-button compact-button" href={student.progressHref}>
                                  Прогресс
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="journal-meta">
                    <button className="button compact-button" type="submit">
                      Сохранить урок
                    </button>
                    <p>Сохраняются посещаемость, оценка и комментарии по ученикам.</p>
                  </div>
                </form>
              )}
            </section>

            <section className="teacher-overview-grid section">
              <div className="panel">
                <div className="section-heading">
                  <div>
                    <h2>Домашнее задание</h2>
                    <p>Задания, связанные с этим уроком.</p>
                  </div>
                </div>

                <InfoList
                  emptyText="Домашнее задание для урока пока не задано."
                  items={data.homework.map((homework) => (
                    <div className="info-row" key={homework.id}>
                      <span>Срок: {homework.due}</span>
                      <strong>{homework.title}</strong>
                      <p>{homework.description}</p>
                    </div>
                  ))}
                />

                <form action={addHomework} className="form-grid lesson-create-form">
                  <label>
                    Название
                    <input name="title" required />
                  </label>
                  <label>
                    Срок
                    <input name="due_date" type="date" />
                  </label>
                  <label className="full-width-field">
                    Описание
                    <textarea name="description" required />
                  </label>
                  <button className="button compact-button" type="submit">
                    Добавить домашнее задание
                  </button>
                </form>
              </div>

              <div className="panel">
                <div className="section-heading">
                  <div>
                    <h2>Материалы</h2>
                    <p>Текстовые материалы и ссылки урока.</p>
                  </div>
                </div>

                <InfoList
                  emptyText="Материалов для урока пока нет."
                  items={data.materials.map((material) => (
                    <div className="info-row" key={material.id}>
                      <span>{material.detail}</span>
                      {material.url ? (
                        <a href={material.url} rel="noreferrer" target="_blank">
                          {material.title}
                        </a>
                      ) : (
                        <strong>{material.title}</strong>
                      )}
                      {material.content ? <p>{material.content}</p> : null}
                    </div>
                  ))}
                />

                <form action={addMaterial} className="form-grid lesson-create-form">
                  <label>
                    Название
                    <input name="title" required />
                  </label>
                  <label>
                    Тип
                    <select name="type" defaultValue="text">
                      <option value="text">Текст</option>
                      <option value="link">Ссылка</option>
                    </select>
                  </label>
                  <label>
                    Видимость
                    <select name="visibility" defaultValue="visible_to_students">
                      <option value="visible_to_students">Видно ученикам</option>
                      <option value="teacher_only">Только преподавателю</option>
                    </select>
                  </label>
                  <label>
                    Ссылка
                    <input name="url" type="url" />
                  </label>
                  <label className="full-width-field">
                    Текст материала
                    <textarea name="content" />
                  </label>
                  <button className="button compact-button" type="submit">
                    Добавить материал
                  </button>
                </form>
              </div>
            </section>
          </>
        );
      }}
    </SupabaseDataPage>
  );
}
