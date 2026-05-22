import { InfoList, MetricGrid, SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getAdminOverview } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";

export default async function AdminPage() {
  const session = await requireWorkspace("admin");
  const result = await getAdminOverview(session.organizationId);

  return (
    <SupabaseDataPage
      title="Сегодня в школе"
      description="Сводка по курсам, группам, ученикам и ближайшим занятиям из Supabase."
      result={result}
    >
      {(data) => (
        <>
          <MetricGrid items={data.metrics} />

          <section className="overview-grid section">
            <div className="panel">
              <h2>Ближайшие занятия</h2>
              <InfoList
                emptyText="Ближайшие занятия пока не созданы."
                items={data.upcomingLessons.map((lesson) => (
                  <div className="info-row" key={lesson.id}>
                    <span>{lesson.when}</span>
                    <strong>{lesson.title}</strong>
                    <p>{lesson.subtitle}</p>
                  </div>
                ))}
              />
            </div>

            <div className="panel">
              <h2>Оплата к вниманию</h2>
              <InfoList
                emptyText="Нет просроченных или ожидающих оплат."
                items={data.duePayments.map((payment) => (
                  <div className="info-row" key={payment.id}>
                    <span>{payment.studentName}</span>
                    <strong>{payment.amount}</strong>
                    <p>
                      {payment.context}; срок {payment.due}; {payment.status}
                    </p>
                  </div>
                ))}
              />
            </div>
          </section>
        </>
      )}
    </SupabaseDataPage>
  );
}
