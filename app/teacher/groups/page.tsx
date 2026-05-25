import Link from "next/link";
import { DataTable, SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getTeacherGroups } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";

export default async function TeacherGroupsPage() {
  const session = await requireWorkspace("teacher");
  const result = await getTeacherGroups(session.organizationId, session.userId);

  return (
    <SupabaseDataPage
      title="Группы преподавателя"
      description="Только группы, где текущий seed-пользователь назначен преподавателем."
      result={result}
    >
      {(data) => (
        <section className="panel">
          <DataTable
            rows={data.groups}
            keyForRow={(group) => group.id}
            emptyText="За преподавателем пока нет групп."
            columns={[
              {
                header: "Группа",
                render: (group) => (
                  <Link href={`/teacher/groups/${group.id}`}>
                    <strong>{group.name}</strong>
                  </Link>
                ),
              },
              { header: "Курс", render: (group) => group.course },
              { header: "Ученики", render: (group) => group.students },
              { header: "Следующее занятие", render: (group) => group.nextLesson },
              { header: "Проблемы", render: (group) => group.problems },
              { header: "Статус", render: (group) => group.status },
              {
                header: "Действия",
                render: (group) => (
                  <div className="button-row">
                    <Link className="button compact-button" href={`/teacher/groups/${group.id}/journal`}>
                      Журнал
                    </Link>
                    <Link className="secondary-button compact-button" href={`/teacher/groups/${group.id}`}>
                      Группа
                    </Link>
                    {group.nextLessonId ? (
                      <Link className="secondary-button compact-button" href={`/teacher/lessons/${group.nextLessonId}`}>
                        Ближайший урок
                      </Link>
                    ) : null}
                  </div>
                ),
              },
            ]}
          />
        </section>
      )}
    </SupabaseDataPage>
  );
}
