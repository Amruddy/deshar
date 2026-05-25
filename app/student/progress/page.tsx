import { SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getStudentProgress } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";

export default async function StudentProgressPage() {
  const session = await requireWorkspace("student");
  const result = await getStudentProgress(session.organizationId, session.email);

  return (
    <SupabaseDataPage
      title="Прогресс"
      description="Открытые преподавателем правила, ошибки и рекомендации по чтению."
      result={result}
    >
      {(data) => (
        <div className="student-dashboard">
          <section className="student-learning-grid">
            <article className="panel student-progress-section">
              <h2>Правила</h2>
              {data.rules.length > 0 ? (
                <div className="student-progress-items">
                  {data.rules.map((rule) => (
                    <div className="student-progress-item" key={rule.id}>
                      <span className="student-card-meta">{rule.course}</span>
                      <strong>{rule.name}</strong>
                      <p>
                        Уровень: {rule.level}
                        {rule.note ? `; ${rule.note}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Преподаватель пока не открыл правила прогресса.</p>
              )}
            </article>

            <article className="panel student-progress-section">
              <h2>Ошибки и замечания</h2>
              {data.errors.length > 0 ? (
                <div className="student-progress-items">
                  {data.errors.map((error) => (
                    <div className="student-progress-item" key={error.id}>
                      <span className="student-card-meta">{error.course}</span>
                      <strong>{error.name}</strong>
                      {error.note ? <p>{error.note}</p> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p>Открытых ошибок и замечаний пока нет.</p>
              )}
            </article>
          </section>

          <section className="panel student-progress-section">
            <h2>Что повторить</h2>
            {data.records.length > 0 ? (
              <div className="student-progress-items">
                {data.records.map((record) => (
                  <div className="student-progress-item" key={record.id}>
                    <span className="student-card-meta">
                      {record.createdAt}; {record.course}
                    </span>
                    <strong>{record.repeatNote || "Повторение не указано"}</strong>
                    <p>
                      {record.lesson}
                      {record.studentComment ? `; ${record.studentComment}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Открытых записей прогресса пока нет.</p>
            )}
          </section>
        </div>
      )}
    </SupabaseDataPage>
  );
}
