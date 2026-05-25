import Link from "next/link";
import { DataTable, InfoList, SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getTeacherGroupDetail } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";

type TeacherGroupPageProps = {
  params: Promise<{
    groupId: string;
  }>;
};

export default async function TeacherGroupPage({ params }: TeacherGroupPageProps) {
  const session = await requireWorkspace("teacher");
  const { groupId } = await params;
  const result = await getTeacherGroupDetail(session.organizationId, session.userId, session.name, groupId);

  return (
    <SupabaseDataPage
      title="Группа преподавателя"
      description="Рабочая страница своей группы: ближайший урок, состав, расписание и учебные сигналы."
      result={result}
    >
      {(data) => (
        <>
          <section className="teacher-overview-grid">
            <div className="panel teacher-main-panel">
              <div className="section-heading">
                <div>
                  <h2>{data.name}</h2>
                  <p>
                    {data.course}; {data.teacher}; {data.status}
                  </p>
                </div>
                <Link className="secondary-button compact-button" href="/teacher/groups">
                  К группам
                </Link>
              </div>

              {data.nextLesson ? (
                <div className="teacher-highlight">
                  <span>Ближайший урок</span>
                  <strong>{data.nextLesson.when}</strong>
                  <p>
                    {data.nextLesson.title}; {data.nextLesson.subtitle}
                  </p>
                  <div className="button-row">
                    <Link className="button compact-button" href={`/teacher/lessons/${data.nextLesson.id}`}>
                      Ближайший урок
                    </Link>
                    <Link className="secondary-button compact-button" href={`/teacher/groups/${data.id}/journal`}>
                      Журнал
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="teacher-highlight">
                  <span>Ближайший урок</span>
                  <strong>Ближайших уроков нет</strong>
                  <p>Администратор еще не создал занятия по расписанию этой группы.</p>
                  <div className="button-row">
                    <Link className="secondary-button compact-button" href={`/teacher/groups/${data.id}/journal`}>
                      Журнал
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <aside className="panel teacher-side-panel">
              <h2>Сигналы</h2>
              {data.problemSignals.length > 0 ? (
                <div className="signal-list">
                  {data.problemSignals.map((signal) => (
                    <div className="signal-item" data-tone={signal.tone} key={signal.label}>
                      <strong>!</strong>
                      <div>
                        <span>{signal.label}</span>
                        <p>{signal.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="signal-item" data-tone="ok">
                  <strong>OK</strong>
                  <div>
                    <span>Группа готова к работе</span>
                    <p>Есть ученики, расписание и ближайшие занятия.</p>
                  </div>
                </div>
              )}
            </aside>
          </section>

          <section className="grid section">
            <div className="panel">
              <h2>Расписание</h2>
              {data.scheduleRules.length > 0 ? (
                <div className="schedule-card-list">
                  {data.scheduleRules.map((rule) => (
                    <div className="schedule-card" key={rule.id}>
                      <div>
                        <span>{rule.weekday}</span>
                        <strong>{rule.timeRange}</strong>
                        <p>{rule.period}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">Активное расписание пока не настроено.</p>
              )}
            </div>

            <div className="panel">
              <h2>Последние занятия</h2>
              <InfoList
                emptyText="Последних занятий пока нет."
                items={data.recentLessons.map((lesson) => (
                  <div className="info-row" key={lesson.id}>
                    <span>{lesson.when}</span>
                    <Link href={`/teacher/lessons/${lesson.id}`}>{lesson.title}</Link>
                    <p>{lesson.subtitle}</p>
                  </div>
                ))}
              />
            </div>

            <div className="panel">
              <h2>Домашние задания</h2>
              <InfoList
                emptyText="Домашнее задание для группы пока не задано."
                items={data.homework.map((homework) => (
                  <div className="info-row" key={homework.id}>
                    <span>Срок: {homework.due}</span>
                    <strong>{homework.title}</strong>
                    <p>{homework.description}</p>
                  </div>
                ))}
              />
            </div>

            <div className="panel">
              <h2>Материалы</h2>
              <InfoList
                emptyText="Материалов для группы пока нет."
                items={data.materials.map((material) => (
                  <div className="info-row" key={material.id}>
                    <span>{material.detail}</span>
                    <strong>{material.title}</strong>
                  </div>
                ))}
              />
            </div>
          </section>

          <section className="teacher-overview-grid section">
            <div className="panel">
              <h2>Ученики</h2>
              <DataTable
                rows={data.students}
                keyForRow={(student) => student.id}
                emptyText="В группе пока нет активных учеников."
                columns={[
                  {
                    header: "Ученик",
                    render: (student) => (
                      <Link href={`/teacher/students/${student.id}`}>
                        <strong>{student.name}</strong>
                      </Link>
                    ),
                  },
                  { header: "Контакты", render: (student) => student.contacts },
                  { header: "Оплата", render: (student) => student.payment },
                  { header: "Статус", render: (student) => student.status },
                  {
                    header: "Действие",
                    render: (student) => (
                      <Link className="secondary-button compact-button" href={`/teacher/students/${student.id}`}>
                        Ученик
                      </Link>
                    ),
                  },
                ]}
              />
            </div>

            <div className="panel">
              <h2>Оплата к вниманию</h2>
              <InfoList
                emptyText="Нет записей оплаты, требующих внимания."
                items={data.paymentSignals.map((payment) => (
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
