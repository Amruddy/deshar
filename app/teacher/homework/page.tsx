import { DataTable, SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getTeacherHomework } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";
import { createTeacherHomework, updateHomeworkStatus } from "@/app/teacher/actions";

function HomeworkStatusAction({
  homeworkId,
  label,
  status,
  variant = "secondary",
}: {
  homeworkId: string;
  label: string;
  status: "active" | "archived" | "cancelled";
  variant?: "button" | "secondary";
}) {
  const saveStatus = updateHomeworkStatus.bind(null, homeworkId);

  return (
    <form action={saveStatus} className="inline-form">
      <input name="status" type="hidden" value={status} />
      <button className={`${variant === "button" ? "button" : "secondary-button"} compact-button`} type="submit">
        {label}
      </button>
    </form>
  );
}

export default async function TeacherHomeworkPage() {
  const session = await requireWorkspace("teacher");
  const result = await getTeacherHomework(session.organizationId, session.email);

  return (
    <SupabaseDataPage
      title="Домашние задания"
      description="Задания по вашим группам и отдельным ученикам внутри группы."
      result={result}
    >
      {(data) => (
        <>
          <section className="panel section">
            <div className="section-heading">
              <div>
                <h2>Создать задание</h2>
                <p>Групповое задание получат все активные ученики группы. Если выбран ученик, задание будет индивидуальным.</p>
              </div>
            </div>

            {data.groupOptions.length > 0 ? (
              <form action={createTeacherHomework} className="form-grid">
                <label>
                  Группа
                  <select name="group_id" required>
                    {data.groupOptions.map((group) => (
                      <option key={group.value} value={group.value}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Ученик
                  <select name="student_id" defaultValue="">
                    <option value="">вся группа</option>
                    {data.studentOptions.map((student) => (
                      <option key={student.value} value={student.value}>
                        {student.label}
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
                <label>
                  Срок
                  <input name="due_date" type="date" />
                </label>
                <label className="full-width-field">
                  Название
                  <input name="title" required />
                </label>
                <label className="full-width-field">
                  Описание
                  <textarea name="description" required />
                </label>
                <button className="button compact-button" type="submit">
                  Создать домашнее задание
                </button>
              </form>
            ) : (
              <p className="empty-state">За преподавателем пока нет активных групп для создания задания.</p>
            )}
          </section>

          <section className="panel section">
            <DataTable
              rows={data.homework}
              keyForRow={(homework) => homework.id}
              emptyText="Домашних заданий пока нет."
              columns={[
                {
                  header: "Задание",
                  render: (homework) => (
                    <>
                      <strong>{homework.title}</strong>
                      <p>{homework.description}</p>
                    </>
                  ),
                },
                { header: "Контекст", render: (homework) => `${homework.context}; ${homework.student}` },
                { header: "Урок", render: (homework) => homework.lesson },
                { header: "Срок", render: (homework) => homework.due },
                {
                  header: "Материалы",
                  render: (homework) =>
                    homework.materials.length > 0 ? (
                      <div className="info-list">
                        {homework.materials.map((material) => (
                          <div className="info-row" key={material.id}>
                            <span>{material.detail}</span>
                            {material.url ? (
                              <a href={material.url} rel="noreferrer" target="_blank">
                                {material.title}
                              </a>
                            ) : (
                              <strong>{material.title}</strong>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      "нет"
                    ),
                },
                {
                  header: "Действия",
                  render: (homework) => (
                    <div className="table-actions">
                      <span className="status">{homework.status}</span>
                      {homework.statusValue === "active" ? (
                        <>
                          <HomeworkStatusAction homeworkId={homework.id} label="Отменить" status="cancelled" />
                          <HomeworkStatusAction homeworkId={homework.id} label="В архив" status="archived" />
                        </>
                      ) : null}
                      {homework.statusValue === "cancelled" ? (
                        <>
                          <HomeworkStatusAction homeworkId={homework.id} label="Вернуть" status="active" />
                          <HomeworkStatusAction homeworkId={homework.id} label="В архив" status="archived" />
                        </>
                      ) : null}
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
