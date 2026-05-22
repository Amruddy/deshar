import type { ReactNode } from "react";
import type { DataResult, MetricItem } from "@/app/lib/data/supabase-read";

type SupabaseDataPageProps<T> = {
  title: string;
  description: string;
  result: DataResult<T>;
  children: (data: T) => ReactNode;
};

type TableColumn<T> = {
  header: string;
  render: (row: T) => ReactNode;
};

export function SupabaseDataPage<T>({ title, description, result, children }: SupabaseDataPageProps<T>) {
  return (
    <>
      <div className="page-heading">
        <span className="status">{result.state === "ready" ? "Данные" : "Состояние"}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {result.state === "setup" ? <SupabaseSetupPanel missingEnv={result.missingEnv} /> : null}
      {result.state === "error" ? <SupabaseErrorPanel message={result.message} /> : null}
      {result.state === "ready" ? children(result.data) : null}
    </>
  );
}

function SupabaseSetupPanel({ missingEnv }: { missingEnv: string[] }) {
  return (
    <section className="panel system-state" data-supabase-state="setup">
      <h2>Supabase не настроен</h2>
      <p>
        Для этого раздела нужны переменные окружения и примененная схема Supabase. Добавьте значения в `.env.local`,
        примените миграции и перезапустите dev-сервер.
      </p>
      <ul className="muted-list">
        {missingEnv.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </section>
  );
}

function isNotFoundMessage(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("не найден") || normalized.includes("не найдена") || normalized.includes("not found");
}

function SupabaseErrorPanel({ message }: { message: string }) {
  const notFound = isNotFoundMessage(message);

  return (
    <section className="panel system-state" data-supabase-state="error">
      <h2>{notFound ? "Данные не найдены" : "Не удалось загрузить данные"}</h2>
      <p>
        {notFound
          ? "Запись не существует или недоступна в текущей рабочей области."
          : "Раздел временно не загрузился. Повторите действие или проверьте подключение Supabase."}
      </p>
      {notFound ? null : <p className="technical-detail">{message}</p>}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty-state" role="status">
      <strong>Пока пусто</strong>
      <p>{text}</p>
    </div>
  );
}

export function MetricGrid({ items }: { items: MetricItem[] }) {
  return (
    <section className="metric-grid">
      {items.map((item) => (
        <div className="panel metric-card" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.detail ? <p>{item.detail}</p> : null}
        </div>
      ))}
    </section>
  );
}

export function InfoList({ emptyText, items }: { emptyText: string; items: ReactNode[] }) {
  if (items.length === 0) {
    return <EmptyState text={emptyText} />;
  }

  return <div className="info-list">{items}</div>;
}

export function DataTable<T>({
  columns,
  emptyText,
  keyForRow,
  rows,
}: {
  columns: TableColumn<T>[];
  emptyText: string;
  keyForRow: (row: T) => string;
  rows: T[];
}) {
  if (rows.length === 0) {
    return <EmptyState text={emptyText} />;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={keyForRow(row)}>
              {columns.map((column) => (
                <td data-label={column.header} key={column.header}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
