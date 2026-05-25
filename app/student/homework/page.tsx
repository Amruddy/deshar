import { SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getStudentHomework } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";

export default async function StudentHomeworkPage() {
  const session = await requireWorkspace("student");
  const result = await getStudentHomework(session.organizationId, session.email);

  return (
    <SupabaseDataPage
      title="Домашние задания"
      description="Активные задания ученика: групповые и индивидуальные."
      result={result}
    >
      {(data) => (
        <div className="student-dashboard">
          {data.homework.length > 0 ? (
            <section className="student-detail-list">
              {data.homework.map((homework) => (
                <article className="panel student-detail-card" key={homework.id}>
                  <span className="student-card-meta">
                    Срок: {homework.due}; {homework.context}
                  </span>
                  <strong>{homework.title}</strong>
                  <p>
                    {homework.description}
                    {homework.lesson !== "без связи с уроком" ? `; урок: ${homework.lesson}` : ""}
                  </p>
                  {homework.materials.length > 0 ? (
                    <div className="student-inline-links">
                      {homework.materials.map((material) =>
                        material.url ? (
                          <a href={material.url} key={material.id} rel="noreferrer" target="_blank">
                            {material.title}
                          </a>
                        ) : (
                          <span key={material.id}>{material.title}</span>
                        ),
                      )}
                    </div>
                  ) : null}
                </article>
              ))}
            </section>
          ) : (
            <section className="panel student-compact-card">
              <h2>Заданий пока нет</h2>
              <p>Когда преподаватель добавит домашнее задание, оно появится здесь.</p>
            </section>
          )}
        </div>
      )}
    </SupabaseDataPage>
  );
}
