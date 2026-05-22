import { redirect } from "next/navigation";
import { logout } from "@/app/login/actions";
import { getAppSession, workspaceConfig } from "@/app/lib/dev-auth";

export default async function ProfilePage() {
  const session = await getAppSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <div className="page-heading">
        <span className="status">Профиль</span>
        <h1>{session.name}</h1>
        <p>{session.email}</p>
      </div>

      <section className="panel auth-page-card profile-card">
        <div>
          <h2>Доступ и рабочая область</h2>
          <p>Основные данные текущего входа.</p>
        </div>

        <dl className="profile-list">
          <div>
            <dt>Организация</dt>
            <dd>{session.organizationName}</dd>
          </div>
          <div>
            <dt>Рабочая область</dt>
            <dd>{workspaceConfig[session.activeWorkspace].label}</dd>
          </div>
          <div>
            <dt>Роли</dt>
            <dd>{session.roles.map((role) => workspaceConfig[role].label).join(", ")}</dd>
          </div>
        </dl>

        <form action={logout}>
          <button className="secondary-button" type="submit">
            Выйти
          </button>
        </form>
      </section>
    </>
  );
}
