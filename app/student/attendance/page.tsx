import { SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getStudentAttendance } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";

export default async function StudentAttendancePage() {
  const session = await requireWorkspace("student");
  const result = await getStudentAttendance(session.organizationId, session.userId);

  return (
    <SupabaseDataPage
      title="Посещаемость"
      description="История занятий ученика: присутствие, пропуски и открытые комментарии преподавателя."
      result={result}
    >
      {(data) => (
        <div className="student-dashboard">
          {data.attendance.length > 0 ? (
            <section className="student-detail-list">
              {data.attendance.map((item) => (
                <article className="panel student-detail-card" key={item.id}>
                  <div className="student-attendance-row">
                    <span className="student-card-meta">
                      {item.date}; {item.timeRange}
                    </span>
                    <span className="student-attendance-mark" data-status={item.status}>
                      {item.mark}
                    </span>
                  </div>
                  <strong>{item.lesson}</strong>
                  <p>
                    {item.course}; {item.group}
                  </p>
                  {item.teacherComment ? <p>Комментарий: {item.teacherComment}</p> : null}
                </article>
              ))}
            </section>
          ) : (
            <section className="panel student-compact-card student-attendance-empty">
              <h2>Отметок пока нет</h2>
              <p>Если уроки уже были, преподаватель еще не сохранил по ним журнал. После сохранения здесь появятся посещения и пропуски.</p>
            </section>
          )}
        </div>
      )}
    </SupabaseDataPage>
  );
}
