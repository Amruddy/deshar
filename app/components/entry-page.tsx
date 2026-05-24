import Link from "next/link";
import { getAppSession, isDevAuthEnabled, workspaceConfig } from "@/app/lib/dev-auth";
import {
  loginAsAdmin,
  loginAsPrivateTeacher,
  loginAsStudent,
  loginAsTeacher,
  loginWithPassword,
  registerOwnerAccount,
  requestPasswordReset,
} from "@/app/login/actions";

type EntryPageProps = {
  error?: string;
  message?: string;
};

const roles = [
  {
    action: loginAsAdmin,
    audience: "Для учреждения",
    description: "Курсы, группы, ученики, преподаватели, расписание и оплата в едином учебном журнале.",
    email: "admin@example.test",
    label: "Войти как админ",
    title: "Администратор",
  },
  {
    action: loginAsTeacher,
    audience: "Для преподавателя",
    description: "Уроки, группы, посещаемость, оценки, комментарии, домашние задания и материалы.",
    email: "teacher@example.test",
    label: "Войти как преподаватель",
    title: "Преподаватель",
  },
  {
    action: loginAsStudent,
    audience: "Для ученика",
    description: "Расписание занятий, домашние задания, материалы, прогресс, посещаемость и платежи.",
    email: "student@example.test",
    label: "Войти как ученик",
    title: "Ученик",
  },
  {
    action: loginAsPrivateTeacher,
    audience: "Для частного преподавателя",
    description: "Тот же журнал без отдельной школы: ученики, уроки, материалы и базовый учет.",
    email: "solo-teacher@example.test",
    label: "Войти как преподаватель-одиночка",
    title: "Преподаватель-одиночка",
  },
];

const errorMessages: Record<string, string> = {
  auth_callback_failed: "Не удалось завершить вход по ссылке. Запросите новую ссылку или войдите по паролю.",
  auth_callback_missing_code: "Ссылка входа неполная. Запросите новую ссылку.",
  dev_auth_disabled: "Dev-вход доступен только при включенном локальном флаге DESHAR_ENABLE_DEV_AUTH=1.",
  invalid_credentials: "Email или пароль неверные.",
  membership_not_found: "Профиль найден, но активная рабочая область Deshar для него не настроена.",
  missing_credentials: "Введите email и пароль.",
  missing_reset_email: "Введите email для восстановления доступа.",
  profile_disabled: "Доступ для этого профиля отключен. Обратитесь к администратору.",
  profile_not_found: "Аккаунт найден, но профиль Deshar для этого email еще не подключен.",
  registration_account_exists: "Аккаунт с таким email уже зарегистрирован. Войдите по паролю или восстановите доступ.",
  registration_failed: "Не удалось создать аккаунт. Проверьте данные, настройки Supabase Auth и попробуйте еще раз.",
  registration_kind_invalid: "Выберите тип регистрации: школа или преподаватель-одиночка.",
  registration_missing_fields: "Заполните имя, email, пароль и название рабочей области.",
  registration_password_short: "Пароль должен содержать не менее 8 символов.",
  reset_failed: "Не удалось отправить письмо восстановления. Проверьте email и настройки Supabase.",
  supabase_not_configured: "Supabase Auth еще не настроен для этого окружения.",
  workspace_not_available: "Для этого профиля нет доступной рабочей области.",
};

const messageTexts: Record<string, string> = {
  email_confirmed: "Email подтвержден. Можно продолжить работу или войти по email и паролю.",
  password_reset_sent: "Письмо восстановления отправлено. Откройте ссылку из письма, чтобы задать новый пароль.",
  password_updated: "Пароль обновлен. Теперь можно войти по email и паролю.",
  registration_email_sent: "Регистрация создана. Мы отправили письмо подтверждения на email.",
};

export async function EntryPage({ error, message }: EntryPageProps) {
  const session = await getAppSession();
  const showDevAuth = isDevAuthEnabled();
  const currentHomePath = session ? workspaceConfig[session.activeWorkspace].homePath : null;
  const errorMessage = error ? errorMessages[error] ?? "Не удалось выполнить вход." : null;
  const infoMessage = message ? messageTexts[message] ?? null : null;

  return (
    <div className="entry-shell">
      <header className="entry-topbar">
        <Link className="entry-brand" href="/">
          <span className="brand-mark">D</span>
          <span>Deshar</span>
        </Link>
        {session && currentHomePath ? (
          <Link className="secondary-button compact-button" href={currentHomePath}>
            Продолжить работу
          </Link>
        ) : (
          <a className="secondary-button compact-button" href="#entry-login">
            Войти
          </a>
        )}
      </header>

      <main className="entry-content">
        <section className="entry-hero">
          <div className="entry-hero-copy">
            <span className="status">Электронный журнал</span>
            <h1>Deshar</h1>
            <p>
              Продукт для образовательных учреждений, преподавателей и учеников: расписание, уроки, журнал
              посещаемости, оценки, домашние задания, материалы, прогресс и оплата в одном месте.
            </p>
            <div className="button-row">
              <a className="button" href="#entry-login">
                Выбрать вход
              </a>
              {session && currentHomePath ? (
                <Link className="secondary-button" href={currentHomePath}>
                  Продолжить как {session.name}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="entry-journal-preview" aria-label="Пример учебного журнала">
            <div className="entry-preview-header">
              <div>
                <span>Сегодня</span>
                <strong>Журнал группы</strong>
              </div>
              <span className="entry-preview-badge">Таджвид</span>
            </div>
            <div className="entry-preview-table">
              <div className="entry-preview-row entry-preview-head">
                <span>Ученик</span>
                <span>Посещ.</span>
                <span>Оценка</span>
                <span>ДЗ</span>
              </div>
              <div className="entry-preview-row">
                <strong>Амина Исмаилова</strong>
                <span className="entry-mark entry-mark-ok">П</span>
                <span>5</span>
                <span>есть</span>
              </div>
              <div className="entry-preview-row">
                <strong>Ученик</strong>
                <span className="entry-mark entry-mark-warning">У</span>
                <span>-</span>
                <span>ссылка</span>
              </div>
              <div className="entry-preview-row">
                <strong>Amruddy</strong>
                <span className="entry-mark entry-mark-danger">Н</span>
                <span>-</span>
                <span>-</span>
              </div>
            </div>
          </div>
        </section>

        <section className="login-workspace section" id="entry-login" aria-label="Вход в Deshar">
          <div className="panel login-main-panel">
            <div>
              <span className="status">Вход</span>
              <h2>Войти по email</h2>
              <p>Используйте email и пароль, которые связаны с вашим аккаунтом Deshar.</p>
            </div>

            {errorMessage ? (
              <div className="error-message" role="alert">
                {errorMessage}
              </div>
            ) : null}

            {infoMessage ? (
              <div className="success-message" role="status">
                {infoMessage}
              </div>
            ) : null}

            <form action={loginWithPassword} className="form-grid auth-form">
              <label>
                Email
                <input name="email" type="email" autoComplete="email" required />
              </label>
              <label>
                Пароль
                <input name="password" type="password" autoComplete="current-password" required />
              </label>
              <button className="button" type="submit">
                Войти
              </button>
            </form>
          </div>

          <div className="panel login-side-panel">
            <div>
              <span className="status">Восстановление</span>
              <h2>Задать новый пароль</h2>
              <p>Если пароль потерян, система отправит письмо восстановления на email аккаунта.</p>
            </div>
            <form action={requestPasswordReset} className="form-grid auth-form single-column-form">
              <label>
                Email
                <input name="resetEmail" type="email" autoComplete="email" required />
              </label>
              <button className="secondary-button" type="submit">
                Отправить письмо
              </button>
            </form>
          </div>

          <section className="panel registration-panel" id="entry-registration" aria-label="Регистрация в Deshar">
            <div className="registration-heading">
              <span className="status">Регистрация</span>
              <h2>Создать рабочую область</h2>
            </div>

            <div className="registration-options">
              <form action={registerOwnerAccount} className="form-grid auth-form registration-form">
                <input name="registrationKind" type="hidden" value="school_admin" />
                <div className="registration-form-intro">
                  <h3>Новая школа</h3>
                  <p>Создает школу и первого администратора-владельца.</p>
                </div>
                <label>
                  Имя владельца
                  <input name="ownerName" autoComplete="name" required />
                </label>
                <label>
                  Email
                  <input name="registrationEmail" type="email" autoComplete="email" required />
                </label>
                <label>
                  Пароль
                  <input name="registrationPassword" type="password" autoComplete="new-password" minLength={8} required />
                </label>
                <label>
                  Название школы
                  <input name="organizationName" autoComplete="organization" required />
                </label>
                <button className="button" type="submit">
                  Создать школу
                </button>
              </form>

              <form action={registerOwnerAccount} className="form-grid auth-form registration-form">
                <input name="registrationKind" type="hidden" value="solo_teacher" />
                <div className="registration-form-intro">
                  <h3>Преподаватель-одиночка</h3>
                  <p>Создает личный кабинет с доступом к журналу и ограниченному администрированию.</p>
                </div>
                <label>
                  Имя преподавателя
                  <input name="ownerName" autoComplete="name" required />
                </label>
                <label>
                  Email
                  <input name="registrationEmail" type="email" autoComplete="email" required />
                </label>
                <label>
                  Пароль
                  <input name="registrationPassword" type="password" autoComplete="new-password" minLength={8} required />
                </label>
                <label>
                  Название кабинета
                  <input name="organizationName" autoComplete="organization" required />
                </label>
                <button className="secondary-button" type="submit">
                  Создать кабинет
                </button>
              </form>
            </div>
          </section>
        </section>

        {error && !errorMessage ? (
          <div className="error-message entry-error" role="alert">
            Не удалось выполнить вход. Проверьте данные и попробуйте еще раз.
          </div>
        ) : null}

        {showDevAuth ? (
          <section className="entry-role-grid section" aria-label="Dev-вход по ролям">
            {roles.map((role) => (
              <form action={role.action} className="panel entry-role-card" key={role.email}>
                <span>{role.audience}</span>
                <h2>{role.title}</h2>
                <p>{role.description}</p>
                <strong>{role.email}</strong>
                <button className="button" type="submit">
                  {role.label}
                </button>
              </form>
            ))}
          </section>
        ) : null}

        <section className="entry-info-grid section">
          <div className="panel">
            <h2>Что закрывает журнал</h2>
            <ul className="muted-list">
              <li>Администратор видит группы, учеников, расписание, уроки и оплату.</li>
              <li>Преподаватель ведет урок, посещаемость, оценки, комментарии и материалы.</li>
              <li>Ученик открывает свое расписание, домашние задания, материалы и прогресс.</li>
            </ul>
          </div>

          <div className="panel">
            <h2>Вход сейчас</h2>
            <p>
              В Release 1.0 вход переводится на настоящие аккаунты Supabase Auth. Dev-вход по ролям доступен только
              в локальном режиме при отдельном флаге окружения.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
