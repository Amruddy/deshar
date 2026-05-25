import Link from "next/link";
import { DataTable, SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getTeacherStudents } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";

export default async function TeacherStudentsPage() {
  const session = await requireWorkspace("teacher");
  const result = await getTeacherStudents(session.organizationId, session.email);

  return (
    <SupabaseDataPage
      title="Ученики преподавателя"
      description="Ученики из активных групп текущего преподавателя."
      result={result}
    >
      {(data) => (
        <section className="panel">
          <DataTable
            rows={data.students}
            keyForRow={(student) => student.id}
            emptyText="У преподавателя пока нет активных учеников."
            columns={[
              { header: "Ученик", render: (student) => <strong>{student.name}</strong> },
              { header: "Контакты", render: (student) => student.contacts },
              { header: "Группы", render: (student) => student.groups },
              { header: "Оплата", render: (student) => student.payment },
              {
                header: "Действие",
                render: (student) => (
                  <Link className="secondary-button compact-button" href={`/teacher/students/${student.id}`}>
                    Прогресс
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
