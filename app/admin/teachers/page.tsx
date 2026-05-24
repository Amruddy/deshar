import { redirect } from "next/navigation";
import { createTeacher, disableTeacherAccess, inviteTeacherAccess } from "@/app/admin/actions";
import { ConfirmSubmitButton } from "@/app/components/confirm-submit-button";
import { PageCreateAction } from "@/app/components/page-create-action";
import { DataTable, MetricGrid, SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getAdminTeachers, type AdminTeacherItem } from "@/app/lib/data/supabase-read";
import { isSoloTeacherSession, requireWorkspace } from "@/app/lib/dev-auth";

type AdminTeachersPageProps = {
  searchParams: Promise<{
    accessError?: string;
    accessMessage?: string;
  }>;
};

const accessMessages: Record<string, string> = {
  access_disabled: "Доступ отключен. Учебная история сохранена.",
  invite_sent: "Приглашение отправлено через Supabase Auth.",
};

const accessErrors: Record<string, string> = {
  disable_failed: "Не удалось отключить доступ. Проверьте Supabase и попробуйте еще раз.",
  invite_failed: "Не удалось отправить приглашение. Проверьте email, Supabase Auth и попробуйте еще раз.",
  supabase_failed: "Supabase Auth не выполнил действие. Проверьте настройки Auth, SMTP и Site URL.",
};

function TeacherAccessAction({ currentUserId, teacher }: { currentUserId: string; teacher: AdminTeacherItem }) {
  if (teacher.id === currentUserId) {
    return <span>текущий пользователь</span>;
  }

  if (teacher.accessAction === "invite" || teacher.accessAction === "resend") {
    return (
      <form action={inviteTeacherAccess.bind(null, teacher.id)} className="inline-form">
        <button className="button compact-button" type="submit">
          {teacher.accessAction === "resend" ? "Отправить повторно" : "Пригласить"}
        </button>
      </form>
    );
  }

  if (teacher.accessAction === "disable") {
    return (
      <form action={disableTeacherAccess.bind(null, teacher.id)} className="inline-form">
        <ConfirmSubmitButton
          className="danger-button compact-button"
          message={`Отключить доступ преподавателя ${teacher.name}? Учебная история сохранится.`}
        >
          Отключить
        </ConfirmSubmitButton>
      </form>
    );
  }

  return <span>{teacher.accessDetail}</span>;
}

export default async function AdminTeachersPage({ searchParams }: AdminTeachersPageProps) {
  const session = await requireWorkspace("admin");

  if (isSoloTeacherSession(session)) {
    redirect("/forbidden?required=teachers");
  }

  const params = await searchParams;
  const accessMessage = params.accessMessage ? accessMessages[params.accessMessage] : null;
  const accessError = params.accessError ? accessErrors[params.accessError] ?? accessErrors.invite_failed : null;
  const result = await getAdminTeachers(session.organizationId);

  return (
    <SupabaseDataPage
      title="Преподаватели"
      description="Преподаватели организации, назначенные группы, ученики и ближайшая нагрузка."
      result={result}
    >
      {(data) => (
        <>
          {accessMessage ? (
            <div className="success-message" role="status">
              {accessMessage}
            </div>
          ) : null}
          {accessError ? (
            <div className="error-message" role="alert">
              {accessError}
            </div>
          ) : null}

          <MetricGrid items={data.metrics} />

          <section className="panel section">
            <div className="section-heading">
              <h2>Список преподавателей</h2>
              <PageCreateAction buttonLabel="Добавить преподавателя" title="Новый преподаватель">
                <form action={createTeacher} className="form-grid">
                  <label>
                    Имя
                    <input name="name" required placeholder="Имя преподавателя" />
                  </label>
                  <label>
                    Email
                    <input name="email" type="email" required placeholder="teacher@example.com" />
                  </label>
                  <label>
                    Телефон
                    <input name="phone" placeholder="+7 ..." />
                  </label>
                  <button className="button compact-button" type="submit">
                    Сохранить преподавателя
                  </button>
                </form>
              </PageCreateAction>
            </div>

            <DataTable
              rows={data.teachers}
              keyForRow={(teacher) => teacher.id}
              emptyText="Преподаватели еще не добавлены."
              columns={[
                { header: "Преподаватель", render: (teacher) => <strong>{teacher.name}</strong> },
                { header: "Контакты", render: (teacher) => teacher.contacts },
                { header: "Группы", render: (teacher) => teacher.groups },
                { header: "Активные", render: (teacher) => teacher.activeGroups },
                { header: "Ученики", render: (teacher) => teacher.students },
                { header: "Ближайшие уроки", render: (teacher) => teacher.upcomingLessons },
                { header: "Статус", render: (teacher) => teacher.status },
                {
                  header: "Доступ",
                  render: (teacher) => (
                    <div className="table-detail">
                      <strong>{teacher.access}</strong>
                      <span>{teacher.accessDetail}</span>
                    </div>
                  ),
                },
                { header: "Действие", render: (teacher) => <TeacherAccessAction currentUserId={session.userId} teacher={teacher} /> },
              ]}
            />
          </section>
        </>
      )}
    </SupabaseDataPage>
  );
}
