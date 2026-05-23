# Production Hardening Release 1.0

## 1. Статус

Документ фиксирует результат stage `Production Hardening` в рамках `Release 1.0`.

Stage выполняется после:

- `Production Auth And Real Accounts`;
- `Final Design System And UX Polish`;
- `New Visual Design`;
- `Functional UX Fixes Before Hardening`.

Рабочая ветка stage:

`feat/production-hardening`

## 2. Что проверено и усилено

### 2.1. Env/config

- Публичная Supabase-конфигурация проверяет наличие URL и publishable/anon key.
- `NEXT_PUBLIC_SUPABASE_URL` дополнительно проверяется как корректный `http` или
  `https` URL, чтобы плохое значение не ломало auth cookie lookup.
- Отсутствующая server Supabase-конфигурация больше не маскируется под
  неподключенный профиль пользователя: protected flow возвращает
  `supabase_not_configured`.

### 2.2. Auth и рабочие области

- `dev-auth` остается доступен только при локальном флаге
  `DESHAR_ENABLE_DEV_AUTH=1` и не включается в production-режиме.
- Неавторизованный пользователь перенаправляется на `/login`.
- Пользователь с активной сессией не получает доступ к чужой рабочей области без
  явного переключения роли.
- Disabled-профиль не проходит session resolver.

### 2.3. Server-only границы

- Auth/session helper явно помечен как server-only.
- Supabase read data-layer явно помечен как server-only.
- `SUPABASE_SERVICE_ROLE_KEY` остается в server-only helper и smoke-скриптах,
  не в клиентских компонентах.
- Supabase Auth Admin API используется в server-only data-layer и smoke-скрипте,
  не в браузере.

### 2.4. Proxy и Supabase auth refresh

- Auth refresh в `proxy.ts` стал best-effort: временная ошибка Supabase в proxy
  не должна ломать весь запрос.
- Для proxy-запросов к Supabase добавлен timeout через
  `SUPABASE_FETCH_TIMEOUT_MS`.
- Protected pages все равно проверяют claims/session перед показом закрытых
  данных.

### 2.5. Smoke-проверки

- `smoke:roles` проверяет:
  - закрытые маршруты без входа;
  - рабочие маршруты администратора, преподавателя и ученика;
  - запрет чужих рабочих областей под dev-auth;
  - отсутствие `data-supabase-state="error"` и
    `data-supabase-state="setup"` на ключевых страницах.
- `smoke:auth` проверяет:
  - real Supabase Auth sign-in для admin/teacher/student;
  - `/profile`;
  - logout;
  - запрет чужих рабочих областей;
  - disabled-профиль.
- `smoke:auth` умеет восстанавливать тестовые Supabase Auth аккаунты из
  состояния ban через Admin API, чтобы внешний тестовый state не блокировал
  локальную проверку stage.

## 3. Проверки stage

На stage выполнены:

- `git diff --check`;
- `npm.cmd run lint`;
- `npm.cmd run build`;
- `npm.cmd run smoke:roles`;
- `npm.cmd run smoke:auth`.

## 4. Оставшиеся ограничения Release 1.0

- Нет публичной самостоятельной регистрации.
- Нет OAuth, SSO, MFA и passkeys.
- Нет родительских аккаунтов.
- Нет массовых bulk-приглашений.
- Нет онлайн-оплаты и billing-интеграций.
- Нет production deploy, домена, backup-политики и мониторинга.
- `smoke:auth` предназначен для локального/dev Supabase проекта и не должен
  запускаться против production Supabase.

## 5. Следующий stage

После merge этого stage:

`Release Candidate Smoke And Notes`
