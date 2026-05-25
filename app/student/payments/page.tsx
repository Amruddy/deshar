import { SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getStudentPayments } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";

export default async function StudentPaymentsPage() {
  const session = await requireWorkspace("student");
  const result = await getStudentPayments(session.organizationId, session.email);

  return (
    <SupabaseDataPage
      title="Оплата"
      description="Ваши назначенные оплаты, сроки и статусы без онлайн-платежей внутри системы."
      result={result}
    >
      {(data) => (
        <div className="student-dashboard">
          {data.payments.length > 0 ? (
            <section className="student-detail-list">
              {data.payments.map((payment) => (
                <article className="panel student-detail-card" key={payment.id}>
                  <div className="student-attendance-row">
                    <span className="student-card-meta">
                      {payment.period}; срок {payment.due}
                    </span>
                    <span className="payment-status-pill" data-tone={payment.statusTone}>
                      {payment.status}
                    </span>
                  </div>
                  <strong>{payment.amount}</strong>
                  <p>{payment.context}</p>
                  {payment.comment ? <p>Комментарий: {payment.comment}</p> : null}
                </article>
              ))}
            </section>
          ) : (
            <section className="panel student-compact-card">
              <h2>Оплаты пока не назначены</h2>
              <p>Если администратор еще не создал оплату, долг в кабинете не показывается.</p>
            </section>
          )}
        </div>
      )}
    </SupabaseDataPage>
  );
}
