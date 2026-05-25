import { SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getStudentMaterials } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";

export default async function StudentMaterialsPage() {
  const session = await requireWorkspace("student");
  const result = await getStudentMaterials(session.organizationId, session.email);

  return (
    <SupabaseDataPage
      title="Материалы"
      description="Тексты и ссылки, которые преподаватель открыл ученику."
      result={result}
    >
      {(data) => (
        <div className="student-dashboard">
          {data.materials.length > 0 ? (
            <section className="student-detail-list">
              {data.materials.map((material) => (
                <article className="panel student-detail-card" key={material.id}>
                  <span className="student-card-meta">{material.detail}</span>
                  {material.url ? (
                    <a href={material.url} rel="noreferrer" target="_blank">
                      {material.title}
                    </a>
                  ) : (
                    <strong>{material.title}</strong>
                  )}
                  {material.content ? <p>{material.content}</p> : null}
                </article>
              ))}
            </section>
          ) : (
            <section className="panel student-compact-card">
              <h2>Материалов пока нет</h2>
              <p>Открытые преподавателем материалы появятся здесь.</p>
            </section>
          )}
        </div>
      )}
    </SupabaseDataPage>
  );
}
