# План Auth Stage 5. Auth Smoke And Hardening

## 0. Статус

- Статус плана: завершен, PR #52.
- Большой блок: `Release 1.0`.
- Подблок: `Production Auth And Real Accounts`.
- Планируемая ветка: `feat/auth-stage-5-auth-smoke-hardening`.
- Коммит stage: `b624a9d`.
- Merge commit в `main`: `8e3ca33`.
- Roadmap релиза: `docs/roadmap/release-1-roadmap.md`.
- Roadmap auth-блока: `docs/roadmap/production-auth-and-real-accounts-roadmap.md`.
- Предыдущий завершенный plan: `docs/work-plans/completed/29-auth-stage-4-admin-invitations-plan.md`.

## 1. Цель

Проверить и закрепить production-auth flow после появления реальных приглашений:
админ, преподаватель и ученик должны входить через Supabase Auth, попадать только
в свои рабочие области, выходить из системы, а отключенный профиль не должен
проходить session resolver.

Stage должен завершить подплан `Production Auth And Real Accounts` без финального
UI/UX redesign и без production deploy.

## 2. Источники правды

Перед кодом нужно читать:

- `docs/roadmap/README.md`;
- `docs/roadmap/release-1-roadmap.md`;
- `docs/roadmap/production-auth-and-real-accounts-roadmap.md`;
- `docs/specs/03-technical-specs/production-auth.md`;
- `docs/specs/03-technical-specs/api-actions.md`;
- `docs/specs/03-technical-specs/data-model.md`;
- `docs/specs/03-technical-specs/pages-and-routes.md`;
- `docs/specs/03-technical-specs/permissions.md`;
- `docs/work-plans/completed/27-auth-stage-2-supabase-auth-session-foundation-plan.md`;
- `docs/work-plans/completed/28-auth-stage-3-account-linking-schema-plan.md`;
- `docs/work-plans/completed/29-auth-stage-4-admin-invitations-plan.md`.

## 3. Что входит

- Добавить воспроизводимый auth smoke для реальных Supabase Auth аккаунтов:
  - вход админа;
  - вход преподавателя;
  - вход ученика;
  - доступ к своей рабочей области;
  - redirect неавторизованного пользователя на `/login`;
  - запрет чужих рабочих областей;
  - logout smoke;
  - отказ для `users.auth_status = 'disabled'`.
- Сохранить существующий cross-role smoke для dev-режима.
- Проверить, что dev-auth остается только за флагом `DESHAR_ENABLE_DEV_AUTH=1`.
- Обновить release limitations после завершения production-auth блока.
- При необходимости точечно укрепить session/logout/redirect поведение, если smoke
  обнаружит разрыв.

## 4. Что не входит

- Production deploy, домен, backup-политика и мониторинг.
- Public self-registration.
- OAuth, SSO, MFA, passkeys.
- Родительские аккаунты.
- Онлайн-оплата и billing-интеграции.
- Массовые bulk-приглашения.
- Финальный UI/UX redesign.

## 5. Проверки

После реализации выполнить:

- `npm.cmd run lint`;
- `npm.cmd run build`;
- `npm.cmd run smoke:roles`;
- `npm.cmd run smoke:auth`;
- smoke `/login`;
- smoke `/profile`;
- smoke `/admin`, `/teacher`, `/student` под соответствующими реальными auth
  аккаунтами;
- smoke чужих рабочих областей: преподаватель не открывает `/admin`, ученик не
  открывает `/teacher`;
- smoke отключенного профиля: пользователь с `auth_status = 'disabled'`
  перенаправляется на `/login?error=profile_disabled`.

## 6. Ручная проверка перед commit/push

После автоматических проверок Codex должен дать пользователю конкретный маршрут:

- открыть `/login`;
- войти реальным email/password аккаунтом администратора;
- открыть `/profile`, затем `/admin`;
- выйти из аккаунта и убедиться, что защищенная страница снова ведет на `/login`;
- войти преподавателем и проверить `/teacher`, затем попытаться открыть `/admin`;
- войти учеником и проверить `/student`, затем попытаться открыть `/teacher`;
- проверить, что отключенный тестовый профиль показывает ошибку доступа, а не
  рабочую область.

## 7. Следующий stage

После merge этого stage:

`Final Design System And UX Polish`
