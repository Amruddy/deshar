import Link from "next/link";
import { DataTable, SupabaseDataPage } from "@/app/components/supabase-data-page";
import { PageCreateAction } from "@/app/components/page-create-action";
import { SubmitButton } from "@/app/components/submit-button";
import { getAdminGroups } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";
import { assignStudentToGroup, createGroup } from "@/app/admin/actions";

type AdminGroupsPageProps = {
  searchParams: Promise<{
    actionError?: string;
    actionMessage?: string;
  }>;
};

const actionMessages: Record<string, string> = {
  group_created: "Группа создана. Она уже доступна в списке.",
  student_assigned: "Ученик добавлен в группу.",
};

const actionErrors: Record<string, string> = {
  group_create_failed: "Не удалось создать группу. Проверьте поля и подключение Supabase.",
  student_assign_failed: "Не удалось добавить ученика в группу. Проверьте поля и подключение Supabase.",
  supabase_failed: "Supabase временно не ответил. Повторите действие через несколько секунд.",
};

export default async function AdminGroupsPage({ searchParams }: AdminGroupsPageProps) {
  const session = await requireWorkspace("admin");
  const params = await searchParams;
  const result = await getAdminGroups(session.organizationId);
  const actionMessage = params.actionMessage ? actionMessages[params.actionMessage] : null;
  const actionError = params.actionError ? actionErrors[params.actionError] : null;

  return (
    <SupabaseDataPage
      title="Группы"
      description="Группы, преподаватели, состав и ближайшие занятия из Supabase."
      result={result}
    >
      {(data) => (
        <section className="panel">
          <div className="section-heading">
            <h2>Список групп</h2>
            <div className="button-row">
              <PageCreateAction buttonLabel="Создать группу" title="Новая группа">
                <form action={createGroup} className="form-grid">
                  <label>
                    Название
                    <input name="name" required placeholder="Например: Вечерняя группа" />
                  </label>
                  <label>
                    Курс
                    <select name="courseId" required defaultValue="">
                      <option value="" disabled>
                        Выберите курс
                      </option>
                      {data.courseOptions.map((course) => (
                        <option key={course.value} value={course.value}>
                          {course.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Преподаватель
                    <select name="teacherId" required defaultValue="">
                      <option value="" disabled>
                        Выберите преподавателя
                      </option>
                      {data.teacherOptions.map((teacher) => (
                        <option key={teacher.value} value={teacher.value}>
                          {teacher.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Статус
                    <select name="status" required defaultValue="active">
                      <option value="recruiting">Набор</option>
                      <option value="active">Активна</option>
                      <option value="paused">Пауза</option>
                    </select>
                  </label>
                  <SubmitButton pendingLabel="Создаем группу...">
                    Сохранить группу
                  </SubmitButton>
                </form>
              </PageCreateAction>

              <PageCreateAction buttonLabel="Добавить ученика в группу" title="Назначить ученика">
                <form action={assignStudentToGroup} className="form-grid">
                  <label>
                    Группа
                    <select name="groupId" required defaultValue="">
                      <option value="" disabled>
                        Выберите группу
                      </option>
                      {data.groupOptions.map((group) => (
                        <option key={group.value} value={group.value}>
                          {group.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Ученик
                    <select name="studentId" required defaultValue="">
                      <option value="" disabled>
                        Выберите ученика
                      </option>
                      {data.studentOptions.map((student) => (
                        <option key={student.value} value={student.value}>
                          {student.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <SubmitButton pendingLabel="Добавляем ученика...">
                    Добавить в группу
                  </SubmitButton>
                </form>
              </PageCreateAction>
            </div>
          </div>
          {actionMessage ? (
            <div className="success-message" role="status">
              {actionMessage}
            </div>
          ) : null}
          {actionError ? (
            <div className="error-message" role="alert">
              {actionError}
            </div>
          ) : null}
          <DataTable
            rows={data.groups}
            keyForRow={(group) => group.id}
            emptyText="Группы еще не созданы."
            columns={[
              { header: "Группа", render: (group) => <strong>{group.name}</strong> },
              { header: "Курс", render: (group) => group.course },
              { header: "Преподаватель", render: (group) => group.teacher },
              { header: "Ученики", render: (group) => group.students },
              { header: "Следующее занятие", render: (group) => group.nextLesson },
              { header: "Статус", render: (group) => group.status },
              {
                header: "Действие",
                render: (group) => (
                  <Link className="secondary-button compact-button" href={`/admin/groups/${group.id}`}>
                    Группа
                  </Link>
                ),
              },
            ]}
          />
        </section>
      )}
    </SupabaseDataPage>
  );
}
