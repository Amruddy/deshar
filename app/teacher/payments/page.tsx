import { DataTable, InfoList, SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getTeacherPayments } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";

export default async function TeacherPaymentsPage() {
  const session = await requireWorkspace("teacher");
  const result = await getTeacherPayments(session.organizationId, session.email);

  return (
    <SupabaseDataPage
      title="Оплаты учеников"
      description="Read-only просмотр оплат учеников из ваших активных групп."
      result={result}
    >
      {(data) => (
        <>
          <section className="teacher-overview-grid section">
            <div className="panel teacher-main-panel">
              <div className="section-heading">
                <div>
                  <h2>Оплаты</h2>
                  <p>Преподаватель видит статусы без действий редактирования.</p>
                </div>
              </div>
              <DataTable
                rows={data.payments}
                keyForRow={(payment) => payment.id}
                emptyText="Оплаты ваших учеников пока не настроены."
                columns={[
                  { header: "Ученик", render: (payment) => <strong>{payment.studentName}</strong> },
                  {
                    header: "Контекст",
                    render: (payment) => (
                      <div className="payment-cell">
                        <strong>{payment.context}</strong>
                        <p>{payment.period}</p>
                        {payment.comment ? <p>{payment.comment}</p> : null}
                      </div>
                    ),
                  },
                  { header: "Сумма", render: (payment) => payment.amount },
                  { header: "Срок", render: (payment) => payment.due },
                  {
                    header: "Статус",
                    render: (payment) => (
                      <span className="payment-status-pill" data-tone={payment.statusTone}>
                        {payment.status}
                      </span>
                    ),
                  },
                ]}
              />
            </div>

            <aside className="panel teacher-side-panel">
              <h2>Группы</h2>
              <InfoList
                emptyText="Активные группы преподавателя пока не назначены."
                items={data.groups.map((group) => (
                  <div className="info-row" key={group}>
                    <span>Группа</span>
                    <strong>{group}</strong>
                  </div>
                ))}
              />
            </aside>
          </section>
        </>
      )}
    </SupabaseDataPage>
  );
}
