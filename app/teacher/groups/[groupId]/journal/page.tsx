import Link from "next/link";
import { SupabaseDataPage } from "@/app/components/supabase-data-page";
import { getTeacherGroupJournal } from "@/app/lib/data/supabase-read";
import { requireWorkspace } from "@/app/lib/dev-auth";
import { saveGroupJournal } from "@/app/teacher/actions";
import { JournalGrid } from "./journal-grid";

type TeacherGroupJournalPageProps = {
  params: Promise<{
    groupId: string;
  }>;
  searchParams?: Promise<{
    month?: string | string[];
  }>;
};

function firstSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TeacherGroupJournalPage({ params, searchParams }: TeacherGroupJournalPageProps) {
  const session = await requireWorkspace("teacher");
  const { groupId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const month = firstSearchValue(resolvedSearchParams?.month);
  const result = await getTeacherGroupJournal(session.organizationId, session.email, groupId, month);

  return (
    <SupabaseDataPage
      title="Журнал"
      description="Ученики, уроки выбранного месяца, посещаемость и оценки."
      result={result}
    >
      {(data) => {
        const saveJournal = saveGroupJournal.bind(null, data.id);

        return (
          <>
            <section className="journal-toolbar">
              <div className="journal-toolbar-main">
                <div>
                  <h2>{data.name}</h2>
                  <p>
                    {data.course}; {data.teacher}; {data.status}
                  </p>
                </div>
                <Link className="secondary-button compact-button" href={`/teacher/groups/${data.id}`}>
                  К группе
                </Link>
              </div>

              <div className="journal-month-bar">
                <Link
                  className="secondary-button compact-button"
                  href={`/teacher/groups/${data.id}/journal?month=${data.previousMonth}`}
                >
                  Предыдущий месяц
                </Link>
                <strong>{data.monthLabel}</strong>
                <Link
                  className="secondary-button compact-button"
                  href={`/teacher/groups/${data.id}/journal?month=${data.nextMonth}`}
                >
                  Следующий месяц
                </Link>
              </div>

              <div className="journal-schedule-strip" data-empty={data.schedule.length === 0 ? "true" : undefined}>
                <span>Расписание месяца</span>
                {data.schedule.length > 0 ? (
                  data.schedule.map((rule) => <strong key={rule}>{rule}</strong>)
                ) : (
                  <strong>Активное расписание не настроено</strong>
                )}
              </div>
            </section>

            <section className="journal-sheet section">
              <div className="section-heading">
                <div>
                  <h2>Журнал</h2>
                  <p>
                    {data.monthLabel}; уроков: {data.lessons.length}; учеников: {data.students.length}; записей:{" "}
                    {data.savedEntries}
                  </p>
                </div>
              </div>

              {data.lessons.length === 0 ? (
                <p className="empty-state">В выбранном месяце у группы нет уроков по активному расписанию.</p>
              ) : data.students.length === 0 ? (
                <p className="empty-state">В группе пока нет активных учеников для журнала.</p>
              ) : (
                <JournalGrid data={data} saveAction={saveJournal} />
              )}
            </section>
          </>
        );
      }}
    </SupabaseDataPage>
  );
}
