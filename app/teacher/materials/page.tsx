import { DataTable, SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getTeacherMaterials } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";
import { createTeacherMaterial, updateMaterialStatus } from "@/app/teacher/actions";

const MATERIAL_STATUS_OPTIONS = [
  { label: "Активен", value: "active" },
  { label: "Скрыт", value: "hidden" },
  { label: "Архив", value: "archived" },
];

const MATERIAL_VISIBILITY_OPTIONS = [
  { label: "Видно ученикам", value: "visible_to_students" },
  { label: "Только преподавателю", value: "teacher_only" },
];

export default async function TeacherMaterialsPage() {
  const session = await requireWorkspace("teacher");
  const result = await getTeacherMaterials(session.organizationId, session.email);

  return (
    <SupabaseDataPage
      title="Материалы"
      description="Текстовые материалы и ссылки, связанные с курсами, группами, уроками, заданиями или учениками."
      result={result}
    >
      {(data) => (
        <>
          <section className="panel section">
            <div className="section-heading">
              <div>
                <h2>Добавить материал</h2>
                <p>Файлы не загружаются: в MPMF 1.0 доступны только текст и внешняя ссылка.</p>
              </div>
            </div>

            {data.contextOptions.length > 0 ? (
              <form action={createTeacherMaterial} className="form-grid">
                <label>
                  Учебный контекст
                  <select name="context" required>
                    {data.contextOptions.map((context) => (
                      <option key={context.value} value={context.value}>
                        {context.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Тип
                  <select name="type" defaultValue="text">
                    <option value="text">Текст</option>
                    <option value="link">Ссылка</option>
                  </select>
                </label>
                <label>
                  Видимость
                  <select name="visibility" defaultValue="visible_to_students">
                    {MATERIAL_VISIBILITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Ссылка
                  <input name="url" type="url" />
                </label>
                <label className="full-width-field">
                  Название
                  <input name="title" required />
                </label>
                <label className="full-width-field">
                  Текст материала
                  <textarea name="content" />
                </label>
                <button className="button compact-button" type="submit">
                  Добавить материал
                </button>
              </form>
            ) : (
              <p className="empty-state">Нет учебных контекстов, куда можно добавить материал.</p>
            )}
          </section>

          <section className="panel section">
            <DataTable
              rows={data.materials}
              keyForRow={(material) => material.id}
              emptyText="Материалов пока нет."
              columns={[
                {
                  header: "Материал",
                  render: (material) => (
                    <>
                      {material.url ? (
                        <a href={material.url} rel="noreferrer" target="_blank">
                          {material.title}
                        </a>
                      ) : (
                        <strong>{material.title}</strong>
                      )}
                      {material.content ? <p>{material.content}</p> : null}
                    </>
                  ),
                },
                { header: "Контекст", render: (material) => material.context },
                { header: "Тип", render: (material) => material.detail },
                { header: "Видимость", render: (material) => material.visibility },
                {
                  header: "Статус",
                  render: (material) => {
                    const saveStatus = updateMaterialStatus.bind(null, material.id);

                    return (
                      <form action={saveStatus} className="inline-form">
                        <select name="status" defaultValue={material.statusValue}>
                          {MATERIAL_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <select name="visibility" defaultValue={material.visibilityValue}>
                          {MATERIAL_VISIBILITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button className="secondary-button compact-button" type="submit">
                          Сохранить
                        </button>
                      </form>
                    );
                  },
                },
              ]}
            />
          </section>
        </>
      )}
    </SupabaseDataPage>
  );
}
