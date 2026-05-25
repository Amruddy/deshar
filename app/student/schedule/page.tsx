import { SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getStudentSchedule } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";

export default async function StudentSchedulePage() {
  const session = await requireWorkspace("student");
  const result = await getStudentSchedule(session.organizationId, session.userId);

  return (
    <SupabaseDataPage
      title="Ближайшие занятия"
      description="Несколько следующих уроков по активным группам ученика."
      result={result}
    >
      {(data) =>
        data.lessons.length > 0 ? (
          <section className="student-schedule-list">
            {data.lessons.map((lesson) => (
              <article className="panel student-schedule-card" key={lesson.id}>
                <div className="student-schedule-time">
                  <span>{lesson.date}</span>
                  <strong>{lesson.timeRange}</strong>
                </div>
                <div className="student-schedule-info">
                  <h2>{lesson.title}</h2>
                  <p>
                    {lesson.course}; {lesson.group}; преподаватель: {lesson.teacher}
                  </p>
                </div>
                <span className="status">{lesson.status}</span>
              </article>
            ))}
          </section>
        ) : (
          <section className="panel system-state">
            <h2>Ближайших занятий пока нет</h2>
            <p>Расписание еще не создано или ближайшие уроки не материализованы.</p>
          </section>
        )
      }
    </SupabaseDataPage>
  );
}
