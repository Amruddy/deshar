# Production Auth And Real Accounts Roadmap

# Roadmap настоящей авторизации и реальных аккаунтов

## 1. Назначение

Этот roadmap открывает следующий блок после завершения `MPMF 1.0`.

Цель блока - заменить dev-auth настоящими аккаунтами через Supabase Auth, не ломая уже готовые рабочие области администратора, преподавателя и ученика.

Этот roadmap является техническим подпланом большого блока `Release 1.0`.

## 2. Источники правды

- `docs/specs/03-technical-specs/production-auth.md`;
- `docs/specs/03-technical-specs/api-actions.md`;
- `docs/specs/03-technical-specs/data-model.md`;
- `docs/specs/03-technical-specs/pages-and-routes.md`;
- официальный Supabase SSR/Auth Admin docs.

## 3. Stages блока

### Auth Stage 1. Specs And Foundation Plan

Статус:

завершен, PR #47.

Цель:

зафиксировать спеки, roadmap и work plan для production auth.

Входит:

- обновление спецификаций;
- фиксация решений по `users.auth_user_id` и `users.auth_status`;
- выбор первого implementation stage;
- список вопросов перед кодом.

Не входит:

- изменение runtime auth;
- миграции;
- установка новых зависимостей.

### Auth Stage 2. Supabase Auth Session Foundation

Статус:

завершен, PR #49.

Цель:

подключить настоящую Supabase Auth session к Next.js app.

Входит:

- `@supabase/ssr`;
- server/client auth utilities;
- callback route;
- login/logout/password reset UI;
- session-based replacement для `getDevSession` на protected routes;
- dev-auth fallback только при dev-флаге.

Не входит:

- массовая админская рассылка приглашений;
- сложная страница управления пользователями.

### Auth Stage 3. Account Linking And Schema

Статус:

завершен, PR #50.

Цель:

связать Supabase Auth user с доменной таблицей `users`.

Входит:

- SQL-изменения для `users.auth_user_id`, `users.auth_status`, `invited_at`, `last_sign_in_at`;
- обновление seed/dev users;
- резолвинг session -> app user -> organization member -> workspace;
- защита, если профиль или активное членство не найдено.

Не входит:

- новая ролевая модель;
- multi-tenant self-service.

### Auth Stage 4. Admin Invitations

Статус:

завершен, PR #51.

Цель:

дать администратору рабочее создание/приглашение аккаунтов.

Входит:

- приглашение преподавателя по email;
- приглашение ученика по email;
- повторная отправка приглашения;
- отключение доступа без удаления учебной истории;
- отображение статуса доступа в списках/карточках.

Не входит:

- публичная регистрация;
- SSO/OAuth/MFA.

### Auth Stage 5. Auth Smoke And Hardening

Статус:

завершен, PR #52.

Цель:

проверить весь auth-flow через реальные аккаунты.

Входит:

- smoke входа админа, преподавателя и ученика;
- logout smoke;
- redirect unauthorized -> `/login`;
- запрет чужих рабочих областей;
- обновление docs/release limitations после auth-блока.

Не входит:

- production deploy;
- billing/online payments.

## 4. Первый implementation stage

После завершения Auth Stage 5 подплан `Production Auth And Real Accounts` считается завершенным.

Следующий stage большого релиза:

`Final Design System And UX Polish`
