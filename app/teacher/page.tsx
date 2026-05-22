import Link from "next/link";
import { InfoList, MetricGrid, SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getTeacherOverview } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";

export default async function TeacherPage() {
  const session = await requireWorkspace("teacher");
  const result = await getTeacherOverview(session.organizationId, session.email);

  return (
    <SupabaseDataPage
      title="Мои занятия и ученики"
      description="Мои группы, ближайшие занятия и ученики, которым нужно внимание."
      result={result}
    >
      {(data) => (
        <>
          <MetricGrid items={data.metrics} />

          <section className="panel section teacher-journal-shortcut">
            <div className="teacher-journal-copy">
              <span className="status">Журнал</span>
              {data.journalShortcut ? (
                <>
                  <h2>{data.journalShortcut.name}</h2>
                  <p>{data.journalShortcut.detail}</p>
                </>
              ) : (
                <>
                  <h2>Журнал группы</h2>
                  <p>За преподавателем пока нет групп с журналом.</p>
                </>
              )}
            </div>
            {data.journalShortcut ? (
              <Link className="button" href={data.journalShortcut.href}>
                Открыть журнал
              </Link>
            ) : (
              <Link className="secondary-button" href="/teacher/groups">
                Открыть группы
              </Link>
            )}
          </section>

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
                emptyText="Нет учеников с просроченной оплатой."
                items={data.attentionPayments.map((payment) => (
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
