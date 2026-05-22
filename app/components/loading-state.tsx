type LoadingStateProps = {
  detail?: string;
  title?: string;
};

export function LoadingState({
  detail = "Получаем актуальные данные из Supabase.",
  title = "Загружаем раздел",
}: LoadingStateProps) {
  return (
    <>
      <div className="page-heading">
        <h1>{title}</h1>
        <p>{detail}</p>
      </div>
      <section className="panel loading-panel" role="status" aria-live="polite">
        <div className="loading-line wide" />
        <div className="loading-line" />
        <div className="loading-grid">
          <div className="loading-card" />
          <div className="loading-card" />
          <div className="loading-card" />
        </div>
      </section>
    </>
  );
}
