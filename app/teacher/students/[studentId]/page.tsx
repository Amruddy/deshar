import Link from "next/link";
import { InfoList, SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getTeacherStudentDetail } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";
import {
  createProgressError,
  createProgressRecord,
  createProgressRule,
  updateProgressError,
  updateProgressRule,
} from "@/app/teacher/actions";

type TeacherStudentPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

const LEVEL_OPTIONS = [
  { label: "Без уровня", value: "" },
  { label: "Отлично", value: "excellent" },
  { label: "Хорошо", value: "good" },
  { label: "Удовлетворительно", value: "satisfactory" },
  { label: "Плохо", value: "poor" },
];

export default async function TeacherStudentPage({ params }: TeacherStudentPageProps) {
  const session = await requireWorkspace("teacher");
  const { studentId } = await params;
  const result = await getTeacherStudentDetail(session.organizationId, session.email, studentId);

  return (
    <SupabaseDataPage
      title="Карточка ученика"
      description="Прогресс таджвида, уроки и учебные материалы ученика из групп текущего преподавателя."
      result={result}
    >
      {(data) => {
        const addRule = createProgressRule.bind(null, data.id);
        const addError = createProgressError.bind(null, data.id);
        const addRecord = createProgressRecord.bind(null, data.id, null);

        return (
          <>
            <section className="teacher-overview-grid">
              <div className="panel teacher-main-panel">
                <div className="section-heading">
                  <div>
                    <h2>{data.name}</h2>
                    <p>
                      {data.contacts}; {data.status}
                    </p>
                  </div>
                  <Link className="secondary-button compact-button" href="/teacher/students">
                    К ученикам
                  </Link>
                </div>

                <div className="teacher-highlight">
                  <span>Активные группы</span>
                  <strong>{data.groups.length}</strong>
                  <p>{data.groups.join("; ") || "нет активных групп"}</p>
                </div>
              </div>

              <aside className="panel teacher-side-panel">
                <h2>Быстрые действия</h2>
                <div className="button-row">
                  <a className="secondary-button compact-button" href="#progress-record">
                    Добавить запись прогресса
                  </a>
                  <a className="secondary-button compact-button" href="#progress-rules">
                    Добавить правило
                  </a>
                  <a className="secondary-button compact-button" href="#progress-errors">
                    Добавить ошибку
                  </a>
                </div>
              </aside>
            </section>

            <section className="teacher-progress-layout section">
              <div className="panel" id="progress-rules">
                <div className="section-heading">
                  <div>
                    <h2>Правила таджвида</h2>
                    <p>Правила, которые преподаватель решил отслеживать у этого ученика.</p>
                  </div>
                </div>

                {data.rules.length > 0 ? (
                  <div className="progress-list">
                    {data.rules.map((rule) => {
                      const saveRule = updateProgressRule.bind(null, rule.id, data.id);

                      return (
                        <form action={saveRule} className="progress-card" key={rule.id}>
                          <div className="progress-card-header">
                            <span>{rule.course}</span>
                            <strong>{rule.level}</strong>
                          </div>
                          <div className="form-grid">
                            <label>
                              Правило
                              <input name="name" defaultValue={rule.name} required />
                            </label>
                            <label>
                              Уровень
                              <select name="level" defaultValue={rule.levelValue}>
                                {LEVEL_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="full-width-field">
                              Комментарий
                              <textarea name="note" defaultValue={rule.note} />
                            </label>
                            <label className="checkbox-label">
                              <input name="is_visible_to_student" type="checkbox" defaultChecked={rule.isVisibleToStudent} />
                              Видно ученику
                            </label>
                            <label className="checkbox-label">
                              <input name="is_active" type="checkbox" defaultChecked={rule.isActive} />
                              Активно
                            </label>
                            <button className="button compact-button" type="submit">
                              Сохранить правило
                            </button>
                          </div>
                        </form>
                      );
                    })}
                  </div>
                ) : (
                  <p className="empty-state">Правила пока не добавлены.</p>
                )}

                <form action={addRule} className="form-grid progress-create-form">
                  <label>
                    Курс
                    <select name="course_id" required>
                      {data.courseOptions.map((course) => (
                        <option key={course.value} value={course.value}>
                          {course.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Новое правило
                    <input name="name" required />
                  </label>
                  <label>
                    Уровень
                    <select name="level" defaultValue="">
                      {LEVEL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="full-width-field">
                    Комментарий
                    <textarea name="note" />
                  </label>
                  <label className="checkbox-label">
                    <input name="is_visible_to_student" type="checkbox" value="true" />
                    Видно ученику
                  </label>
                  <button className="button compact-button" type="submit">
                    Добавить правило
                  </button>
                </form>
              </div>

              <div className="panel" id="progress-errors">
                <div className="section-heading">
                  <div>
                    <h2>Ошибки и замечания</h2>
                    <p>Короткие пометки, которые нужно отслеживать у ученика.</p>
                  </div>
                </div>

                {data.errors.length > 0 ? (
                  <div className="progress-list">
                    {data.errors.map((error) => {
                      const saveError = updateProgressError.bind(null, error.id, data.id);

                      return (
                        <form action={saveError} className="progress-card" key={error.id}>
                          <div className="progress-card-header">
                            <span>{error.course}</span>
                            <strong>{error.isVisibleToStudent ? "видно ученику" : "только преподавателю"}</strong>
                          </div>
                          <div className="form-grid">
                            <label>
                              Ошибка
                              <input name="name" defaultValue={error.name} required />
                            </label>
                            <label className="full-width-field">
                              Комментарий
                              <textarea name="note" defaultValue={error.note} />
                            </label>
                            <label className="checkbox-label">
                              <input name="is_visible_to_student" type="checkbox" defaultChecked={error.isVisibleToStudent} />
                              Видно ученику
                            </label>
                            <label className="checkbox-label">
                              <input name="is_active" type="checkbox" defaultChecked={error.isActive} />
                              Активно
                            </label>
                            <button className="button compact-button" type="submit">
                              Сохранить ошибку
                            </button>
                          </div>
                        </form>
                      );
                    })}
                  </div>
                ) : (
                  <p className="empty-state">Ошибки пока не добавлены.</p>
                )}

                <form action={addError} className="form-grid progress-create-form">
                  <label>
                    Курс
                    <select name="course_id" required>
                      {data.courseOptions.map((course) => (
                        <option key={course.value} value={course.value}>
                          {course.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Новая ошибка
                    <input name="name" required />
                  </label>
                  <label className="full-width-field">
                    Комментарий
                    <textarea name="note" />
                  </label>
                  <label className="checkbox-label">
                    <input name="is_visible_to_student" type="checkbox" value="true" />
                    Видно ученику
                  </label>
                  <button className="button compact-button" type="submit">
                    Добавить ошибку
                  </button>
                </form>
              </div>
            </section>

            <section className="panel section" id="progress-record">
              <div className="section-heading">
                <div>
                  <h2>Записи прогресса</h2>
                  <p>История коротких обновлений: что повторить и что показать ученику.</p>
                </div>
              </div>

              <InfoList
                emptyText="Записей прогресса пока нет."
                items={data.records.map((record) => (
                  <div className="info-row" key={record.id}>
                    <span>
                      {record.createdAt}; {record.course}; {record.isVisibleToStudent ? "видно ученику" : "только преподавателю"}
                    </span>
                    <strong>{record.repeatNote || "Повторение не указано"}</strong>
                    <p>
                      {record.lesson}; {record.studentComment || "комментарий ученику не заполнен"}
                      {record.internalComment ? `; внутренне: ${record.internalComment}` : ""}
                    </p>
                  </div>
                ))}
              />

              <form action={addRecord} className="form-grid progress-create-form">
                <label>
                  Курс
                  <select name="course_id" required>
                    {data.courseOptions.map((course) => (
                      <option key={course.value} value={course.value}>
                        {course.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Урок
                  <select name="lesson_id" defaultValue="">
                    <option value="">без связи с уроком</option>
                    {data.lessonOptions.map((lesson) => (
                      <option key={lesson.value} value={lesson.value}>
                        {lesson.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="full-width-field">
                  Что повторить
                  <textarea name="repeat_note" required />
                </label>
                <label className="full-width-field">
                  Комментарий ученику
                  <textarea name="student_comment" />
                </label>
                <label className="full-width-field">
                  Внутренний комментарий
                  <textarea name="internal_comment" />
                </label>
                <label className="checkbox-label">
                  <input name="is_visible_to_student" type="checkbox" value="true" />
                  Видно ученику
                </label>
                <button className="button compact-button" type="submit">
                  Добавить запись прогресса
                </button>
              </form>
            </section>

            <section className="teacher-overview-grid section">
              <div className="panel">
                <h2>Последние уроки</h2>
                <InfoList
                  emptyText="Последних уроков пока нет."
                  items={data.lessons.map((lesson) => (
                    <div className="info-row" key={lesson.id}>
                      <span>{lesson.when}</span>
                      <Link href={`/teacher/lessons/${lesson.id}`}>{lesson.title}</Link>
                      <p>{lesson.subtitle}</p>
                    </div>
                  ))}
                />
              </div>

              <div className="panel">
                <h2>Домашние задания</h2>
                <InfoList
                  emptyText="Домашних заданий пока нет."
                  items={data.homework.map((homework) => (
                    <div className="info-row" key={homework.id}>
                      <span>Срок: {homework.due}</span>
                      <strong>{homework.title}</strong>
                      <p>{homework.description}</p>
                    </div>
                  ))}
                />
              </div>

              <div className="panel">
                <h2>Материалы</h2>
                <InfoList
                  emptyText="Материалов пока нет."
                  items={data.materials.map((material) => (
                    <div className="info-row" key={material.id}>
                      <span>{material.detail}</span>
                      <strong>{material.title}</strong>
                    </div>
                  ))}
                />
              </div>

              <div className="panel">
                <h2>Оплата</h2>
                <InfoList
                  emptyText="Оплата для ученика пока не настроена."
                  items={data.payments.map((payment) => (
                    <div className="info-row" key={payment.id}>
                      <span>
                        {payment.context}; срок {payment.due}
                      </span>
                      <strong>{payment.amount}</strong>
                      <p>{payment.status}</p>
                    </div>
                  ))}
                />
              </div>
            </section>
          </>
        );
      }}
    </SupabaseDataPage>
  );
}
