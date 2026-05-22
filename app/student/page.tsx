import { SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getStudentOverview } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";

export default async function StudentPage() {
  const session = await requireWorkspace("student");
  const result = await getStudentOverview(session.organizationId, session.email);

  return (
    <SupabaseDataPage
      title="Сегодня"
      description="Ближайшее занятие, задания, материалы, прогресс и платежи в одном месте."
      result={result}
    >
      {(data) => {
        const latestHomework = data.homework[0];
        const nextPayment = data.payments[0];

        return (
          <div className="student-dashboard">
            <section className="student-dashboard-top">
              <article className="panel student-dashboard-card student-primary-card">
                <h2>Ближайший урок</h2>
                {data.nextLesson ? (
                  <>
                    <span className="student-card-meta">
                      {data.nextLesson.date}, {data.nextLesson.timeRange}
                    </span>
                    <strong>{data.nextLesson.title}</strong>
                    <p>
                      {data.nextLesson.course}; {data.nextLesson.group}
                    </p>
                    <p>Преподаватель: {data.nextLesson.teacher}</p>
                  </>
                ) : (
                  <p className="empty-state">Ближайший урок пока не назначен.</p>
                )}
              </article>

              <article className="panel student-dashboard-card">
                <h2>Добавленное задание</h2>
                {latestHomework ? (
                  <>
                    <span className="student-card-meta">
                      Срок: {latestHomework.due}; {latestHomework.context}
                    </span>
                    <strong>{latestHomework.title}</strong>
                    <p>{latestHomework.description}</p>
                  </>
                ) : (
                  <p className="empty-state">Активных домашних заданий пока нет.</p>
                )}
              </article>
            </section>

            <section className="student-compact-grid">
              <article className="panel student-compact-card">
                <h2>Материалы</h2>
                {data.materials.length > 0 ? (
                  <div className="student-compact-list">
                    {data.materials.slice(0, 2).map((material) => (
                      <div className="student-compact-item" key={material.id}>
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
                  <p className="empty-state">Открытых материалов пока нет.</p>
                )}
              </article>

              <article className="panel student-compact-card">
                <h2>Прогресс</h2>
                {data.progress.length > 0 ? (
                  <div className="student-compact-list">
                    {data.progress.slice(0, 2).map((item) => (
                      <div className="student-compact-item" key={item}>
                        <strong>{item}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">Открытый прогресс пока не заполнен.</p>
                )}
              </article>

              <article className="panel student-compact-card">
                <h2>Оплата</h2>
                {nextPayment ? (
                  <div className="student-compact-item">
                    <span>
                      {nextPayment.due}; {nextPayment.context}
                    </span>
                    <strong>{nextPayment.amount}</strong>
                    <p>{nextPayment.status}</p>
                  </div>
                ) : (
                  <p className="empty-state">Платежи пока не настроены.</p>
                )}
              </article>
            </section>
          </div>
        );
      }}
    </SupabaseDataPage>
  );
}
