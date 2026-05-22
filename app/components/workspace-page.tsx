import { requireWorkspace, workspaceConfig, type WorkspaceRole } from "@/app/lib/dev-auth";
import { switchWorkspace } from "@/app/login/actions";

type WorkspacePageProps = {
  title: string;
  expectedRole: WorkspaceRole;
  description: string;
  items: string[];
};

export async function WorkspacePage({
  title,
  expectedRole,
  description,
  items,
}: WorkspacePageProps) {
  const session = await requireWorkspace(expectedRole);
  const otherWorkspaces = session.roles.filter((role) => role !== expectedRole);

  return (
    <>
      <div className="page-heading">
        <span className="status">Доступ открыт</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <section className="grid">
        <div className="panel">
          <h2>Текущий вход</h2>
          <p>
            {session.name}: {session.email}
          </p>
        </div>
        <div className="panel">
          <h2>Организация</h2>
          <p>{session.organizationName}</p>
        </div>
        <div className="panel">
          <h2>Рабочая область</h2>
          <p>{workspaceConfig[session.activeWorkspace].label}</p>
        </div>
      </section>

      {otherWorkspaces.length > 0 ? (
        <section className="panel workspace-switcher">
          <h2>Доступные рабочие области</h2>
          <div className="button-row">
            {otherWorkspaces.map((workspace) => (
              <form key={workspace} action={switchWorkspace.bind(null, workspace)}>
                <button className="secondary-button" type="submit">
                  Перейти: {workspaceConfig[workspace].label}
                </button>
              </form>
            ))}
          </div>
        </section>
      ) : null}

      <section className="panel section">
        <h2>Минимальная рабочая область</h2>
        <ul className="muted-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
