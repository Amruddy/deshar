# План Release 1.0 Public Registration And Solo Teacher

## 0. Статус

- Статус плана: активная реализация.
- Большой блок: `Release 1.0`.
- Stage релиза: `Release Stage 9. Public Registration And Solo Teacher`.
- Рабочая ветка: `feat/public-registration-solo-teacher`.
- Предыдущий завершенный plan: `../completed/36-performance-baseline-supabase-plan.md`.
- Roadmap релиза: `docs/roadmap/release-1-roadmap.md`.
- Технические спецификации: `docs/specs/03-technical-specs/production-auth.md`, `docs/specs/03-technical-specs/permissions.md`, `docs/specs/03-technical-specs/pages-and-routes.md`.

## 1. Цель

Добавить production-регистрацию с главной страницы без dev-auth как основного сценария:

- регистрация новой школы с владельцем-администратором;
- регистрация преподавателя-одиночки как владельца своей организации;
- подтверждение email через Supabase Auth;
- сохранение учеников и обычных преподавателей только через приглашения администратора;
- сохранение dev/test входа только для локального режима `DESHAR_ENABLE_DEV_AUTH=1`.

## 2. Источники правды

Перед кодом читать:

- `docs/roadmap/README.md`;
- `docs/roadmap/release-1-roadmap.md`;
- `docs/specs/03-technical-specs/production-auth.md`;
- `docs/specs/03-technical-specs/permissions.md`;
- `docs/specs/03-technical-specs/pages-and-routes.md`;
- `docs/specs/03-technical-specs/data-model.md`;
- `docs/specs/03-technical-specs/states-and-validation.md`;
- `docs/release/release-1-release-candidate.md`.

## 3. Что входит

### 3.1. Главная и вход

- `/` и `/login` показывают единый production-экран входа и регистрации.
- Основные действия: вход, регистрация, восстановление пароля.
- Dev-вход по ролям показывается только локально при `DESHAR_ENABLE_DEV_AUTH=1`.
- После успешного входа пользователь попадает в рабочую область по активной роли.

### 3.2. Регистрация школы

Публичная регистрация школы создает:

- Supabase Auth user через email/password;
- доменный профиль `users`;
- новую `organizations` с типом `school`;
- `organization_members` с ролью `admin` и административными правами;
- после подтверждения email и входа открывает `/admin`.

### 3.3. Регистрация преподавателя-одиночки

Публичная регистрация преподавателя-одиночки создает:

- Supabase Auth user через email/password;
- доменный профиль `users`;
- новую `organizations` с типом `solo_teacher`;
- `organization_members` с бизнес-ролью `solo_teacher`, рабочими ролями `teacher` и ограниченным административным доступом;
- после подтверждения email и входа открывает `/teacher`, с возможностью переключиться в ограниченный `/admin`.

### 3.4. Email confirmation

- Регистрация требует подтверждения email в Supabase.
- До подтверждения пользователь видит сообщение, что нужно открыть письмо.
- Callback `/auth/callback` завершает подтверждение и возвращает пользователя к входу или рабочей области.

### 3.5. Границы

- Ученики и обычные преподаватели школы не регистрируются публично.
- Их создает и приглашает администратор внутри школы.
- Service role key используется только на сервере.
- Прямое browser-side чтение бизнес-таблиц Supabase не добавляется.

## 4. Что не входит

- OAuth/social login.
- SSO, MFA, passkeys.
- Онлайн-оплаты и billing.
- Публичная регистрация учеников.
- Публичная регистрация обычного преподавателя в существующую школу без приглашения.
- Полноценная multi-tenant self-service настройка тарифов.
- Production deploy, домен и SMTP, кроме описания нужных Supabase-настроек.

## 5. Supabase-настройки для пользователя

Перед ручной production-проверкой в Supabase нужно:

- включить Email provider;
- включить email confirmation;
- добавить redirect URL `/auth/callback` для локального и production-домена;
- проверить Site URL;
- убедиться, что `SUPABASE_SERVICE_ROLE_KEY` доступен только серверу;
- при необходимости настроить SMTP, если стандартные письма Supabase не подходят.

## 6. Рабочий порядок

1. Обновить specs и roadmap под публичную регистрацию.
2. Проверить текущие auth actions, callback, session resolver и роль преподавателя-одиночки.
3. Добавить server action регистрации.
4. Обновить EntryPage: вход, регистрация школы, регистрация преподавателя-одиночки, восстановление.
5. Обновить session/permissions, если нужен `solo_teacher`.
6. Добавить smoke для регистрации или расширить `smoke:auth`.
7. Выполнить проверки и дать ручной smoke-маршрут перед commit/push.

## 7. Проверки

Минимум:

- `git diff --check`;
- `npm.cmd run lint`;
- `npm.cmd run build`;
- `npm.cmd run smoke:auth`;
- `npm.cmd run smoke:roles`;
- ручная проверка регистрации школы и преподавателя-одиночки в Supabase Auth.

Если email confirmation невозможно пройти локально без реального письма, stage должен проверить создание pending-регистрации и явно описать ручной шаг в Supabase.

## 8. Definition of Done

Stage завершен, если:

- публичная регистрация школы и преподавателя-одиночки описана в specs;
- регистрация создает корректные Supabase Auth и доменные записи;
- email confirmation flow не ломает вход и reset password;
- ученики и обычные преподаватели остаются invite-only;
- dev-auth скрыт в production;
- проверки пройдены или внешний Supabase blocker явно описан;
- пользователь получил ручной маршрут перед commit/push.
