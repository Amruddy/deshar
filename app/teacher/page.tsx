import Link from "next/link";
import { InfoList, SupabaseDataPage } from "@/app/components/supabase-data-page";
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
      {(data) => {
        const nextLesson = data.upcomingLessons[0];

        return (
        <>
          <section className="teacher-overview-grid teacher-dashboard-hero">
            <div className="panel teacher-main-panel teacher-next-lesson-card">
              <span className="status">Ближайший урок</span>
              {nextLesson ? (
                <>
                  <div className="teacher-next-lesson-head">
                    <div>
                      <h2>{nextLesson.title}</h2>
                      <p>{nextLesson.subtitle}</p>
                    </div>
                    <strong>{nextLesson.when}</strong>
                  </div>
                  <div className="button-row">
                    <Link className="button" href={`/teacher/lessons/${nextLesson.id}`}>
                      Урок
                    </Link>
                    {data.journalShortcut ? (
                      <Link className="secondary-button" href={data.journalShortcut.href}>
                        Журнал
                      </Link>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <h2>Ближайших уроков нет</h2>
                  <p>Когда администратор создаст занятия по расписанию, ближайший урок появится здесь.</p>
                  <div className="button-row">
                    <Link className="secondary-button" href="/teacher/groups">
                      Группы
                    </Link>
                  </div>
                </>
              )}
            </div>

            <aside className="panel teacher-side-panel">
              <div className="section-heading">
                <h2>Сигналы</h2>
              </div>
              <div className="signal-list">
                {data.problemSignals.length > 0 ? (
                  data.problemSignals.map((signal, index) => (
                    <div className="signal-item" data-tone={signal.tone} key={`${signal.label}-${index}`}>
                      <strong>!</strong>
                      <div>
                        <span>{signal.label}</span>
                        <p>{signal.detail}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="signal-item" data-tone="ok">
                    <strong>OK</strong>
                    <div>
                      <span>Нет срочных сигналов</span>
                      <p>Слабая посещаемость и оплата к вниманию не найдены.</p>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </section>

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
                Журнал
              </Link>
            ) : (
              <Link className="secondary-button" href="/teacher/groups">
                Группы
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
        );
      }}
    </SupabaseDataPage>
  );
}
