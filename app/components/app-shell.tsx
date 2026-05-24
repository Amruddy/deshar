import Link from "next/link";
import type { ReactNode } from "react";
import { AppNavLink, type NavIcon } from "@/app/components/app-nav-link";
import { getAppSession, isSoloTeacherSession, workspaceConfig, type AppSession, type WorkspaceRole } from "@/app/lib/dev-auth";
import { logout, switchWorkspace } from "@/app/login/actions";

type NavItem = {
  href: string;
  icon: NavIcon;
  label: string;
};

const navByWorkspace: Record<WorkspaceRole, NavItem[]> = {
  admin: [
    { href: "/admin", icon: "overview", label: "Обзор" },
    { href: "/admin/courses", icon: "courses", label: "Курсы" },
    { href: "/admin/groups", icon: "groups", label: "Группы" },
    { href: "/admin/students", icon: "students", label: "Ученики" },
    { href: "/admin/teachers", icon: "teachers", label: "Преподаватели" },
    { href: "/admin/payments", icon: "payments", label: "Оплата" },
  ],
  teacher: [
    { href: "/teacher", icon: "overview", label: "Обзор" },
    { href: "/teacher/groups", icon: "groups", label: "Группы" },
    { href: "/teacher/students", icon: "students", label: "Ученики" },
    { href: "/teacher/attendance", icon: "attendance", label: "Посещаемость" },
    { href: "/teacher/homework", icon: "homework", label: "Домашние задания" },
    { href: "/teacher/materials", icon: "materials", label: "Материалы" },
    { href: "/teacher/payments", icon: "payments", label: "Оплата" },
  ],
  student: [
    { href: "/student", icon: "overview", label: "Обзор" },
    { href: "/student/schedule", icon: "calendar", label: "Расписание" },
    { href: "/student/homework", icon: "homework", label: "Домашние задания" },
    { href: "/student/materials", icon: "materials", label: "Материалы" },
    { href: "/student/progress", icon: "progress", label: "Прогресс" },
    { href: "/student/attendance", icon: "attendance", label: "Посещаемость" },
    { href: "/student/payments", icon: "payments", label: "Оплата" },
  ],
};

const publicNav: NavItem[] = [{ href: "/", icon: "login", label: "Вход" }];

function navItemsForSession(session: AppSession) {
  const items = navByWorkspace[session.activeWorkspace];

  if (session.activeWorkspace === "admin" && isSoloTeacherSession(session)) {
    return items.filter((item) => item.href !== "/admin/teachers");
  }

  return items;
}

function WorkspaceSwitcher({ session }: { session: AppSession }) {
  if (session.roles.length < 2) {
    return null;
  }

  return (
    <div className="workspace-switch">
      <p className="sidebar-label">Рабочая область</p>
      <div className="workspace-switch-list">
        {session.roles.map((role) => (
          <form action={switchWorkspace.bind(null, role)} key={role}>
            <button className="workspace-switch-button" type="submit" disabled={role === session.activeWorkspace}>
              {workspaceConfig[role].label}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}

function Sidebar({ items, session }: { items: NavItem[]; session: AppSession | null }) {
  const homePath = session ? workspaceConfig[session.activeWorkspace].homePath : "/";

  return (
    <aside className="sidebar" aria-label="Основная навигация">
      <Link className="brand" href={homePath}>
        <span className="brand-mark">D</span>
        <span className="brand-text">Deshar</span>
      </Link>

      <div className="sidebar-section">
        <p className="sidebar-label">Разделы</p>
        <nav className="side-nav" aria-label="Разделы">
          {items.map((item) => (
            <AppNavLink href={item.href} icon={item.icon} label={item.label} key={item.href} />
          ))}
        </nav>
      </div>

      {session ? <WorkspaceSwitcher session={session} /> : null}

      <div className="sidebar-card">
        {session ? (
          <>
            <strong>{session.name}</strong>
            <div className="sidebar-card-actions">
              <Link className="secondary-button compact-button" href="/profile">
                Профиль
              </Link>
              <form action={logout}>
                <button className="secondary-button compact-button" type="submit">
                  Выйти
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <strong>Тестовый режим</strong>
          </>
        )}
      </div>
    </aside>
  );
}

function MobileNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="mobile-nav" aria-label="Мобильная навигация">
      {items.map((item) => (
        <AppNavLink href={item.href} icon={item.icon} label={item.label} key={item.href} />
      ))}
    </nav>
  );
}

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await getAppSession();
  const items = session ? navItemsForSession(session) : publicNav;

  if (!session) {
    return (
      <div className="public-shell">
        <main className="public-main">{children}</main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar items={items} session={session} />
      <div className="workspace">
        <main className="main">{children}</main>
      </div>
      <MobileNav items={items} />
    </div>
  );
}
