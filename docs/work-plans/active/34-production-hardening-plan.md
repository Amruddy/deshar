# План Production Hardening

## 0. Статус

- Статус плана: активный кодовый stage.
- Большой блок: `Release 1.0`.
- Stage релиза: `Release Stage 6. Production Hardening`.
- Планируемая ветка: `feat/production-hardening`.
- Roadmap релиза: `docs/roadmap/release-1-roadmap.md`.
- Предыдущий завершенный plan: `docs/work-plans/completed/33-functional-ux-fixes-before-hardening-plan.md`.

## 1. Цель

Подготовить продукт к стабильному использованию после production auth, нового
визуального дизайна и функциональных UX-фиксов.

Stage должен закрыть технические и пользовательские риски перед release
candidate smoke:

- проверить env/config и явные ошибки настройки Supabase;
- убедиться, что dev-auth недоступен без явного локального флага;
- проверить закрытые маршруты и запрет чужих рабочих областей;
- проверить server-only границы для service-role ключа и Supabase Admin API;
- привести ошибки, пустые состояния и setup/error states к понятному виду;
- обновить release limitations, если после проверок остаются известные ограничения.

## 2. Источники правды

Перед кодом нужно читать:

- `docs/roadmap/README.md`;
- `docs/roadmap/release-1-roadmap.md`;
- `docs/specs/03-technical-specs/production-auth.md`;
- `docs/specs/03-technical-specs/permissions.md`;
- `docs/specs/03-technical-specs/pages-and-routes.md`;
- `docs/specs/03-technical-specs/states-and-validation.md`;
- `docs/specs/03-technical-specs/api-actions.md`;
- `docs/specs/04-visual-rules.md`;
- `docs/release/release-1-auth-readiness.md`;
- `docs/skills/deshar-design-system/SKILL.md`, если меняется интерфейс.

## 3. Что входит

### 3.1. Env/config hardening

- Проверить обязательные переменные Supabase для runtime, smoke и auth flow.
- Проверить, что ошибки настройки показываются как setup-state, а не как
  технический stack trace в пользовательском интерфейсе.
- Проверить, что production-режим не включает dev-auth без
  `DESHAR_ENABLE_DEV_AUTH=1`.

### 3.2. Auth и закрытые маршруты

- Проверить redirect неавторизованного пользователя на `/login`.
- Проверить запрет доступа ученика к `/admin` и `/teacher`.
- Проверить запрет доступа преподавателя к чужим группам, ученикам и журналам.
- Проверить запрет доступа ученика к чужим данным через подстановку ID.
- Проверить поведение disabled-пользователя.

### 3.3. Server-only и service-role границы

- Проверить, что `SUPABASE_SERVICE_ROLE_KEY` используется только на сервере.
- Проверить, что Supabase Auth Admin API не вызывается из клиентских компонентов.
- Проверить, что server actions и data-layer не доверяют неподтвержденной
  cookie-сессии без проверки активного профиля, членства и роли.

### 3.4. Ошибки, пустые состояния и ограничения

- Проверить ключевые страницы на понятные `нет данных`, `нет доступа`,
  `не найдено`, `setup` и `error` состояния.
- Убрать оставшиеся технические сообщения там, где пользователь должен видеть
  рабочее объяснение.
- Проверить, что ошибки не раскрывают существование чужих данных.
- Обновить release limitations, если остается поведение, которое не входит в
  Release 1.0.

### 3.5. Smoke scripts и release readiness

- Проверить актуальность `smoke:roles` и `smoke:auth`.
- Проверить, что smoke не требует production-проекта Supabase и не выполняет
  опасных действий вне локального/dev окружения.
- Зафиксировать результат hardening в release-документации.

## 4. Что не входит

- Новый visual redesign.
- Изменение auth-flow, если он уже соответствует production-auth spec.
- Новые роли, права или публичная регистрация.
- Онлайн-оплата или billing-интеграции.
- Production deploy, домен, backup-политика и мониторинг.
- Новые продуктовые функции за пределами hardening.
- Полная security audit внешней инфраструктуры.

## 5. Рабочий порядок

1. Сначала диагностировать env/config, auth guards, data-layer и route access.
2. Перед кодом кратко указать, какие пункты плана будут изменены, какие файлы
   затрагиваются и какие проверки будут выполнены.
3. Исправлять только hardening-дефекты, не начинать новый redesign или новый
   auth-stage.
4. После каждого крупного блока запускать релевантную проверку.
5. Перед commit/push дать пользователю ручной маршрут проверки.

## 6. Проверки

После реализации выполнить:

- `git diff --check`;
- `npm.cmd run lint`;
- `npm.cmd run build`;
- `npm.cmd run smoke:roles`;
- `npm.cmd run smoke:auth`, если тестовые Supabase Auth аккаунты доступны;
- smoke `/login`;
- smoke `/profile`;
- smoke `/admin`;
- smoke `/teacher`;
- smoke `/student`;
- smoke закрытого маршрута без входа;
- smoke запрета чужой рабочей области;
- проверить, что ключевые страницы не показывают
  `data-supabase-state="error"` или `data-supabase-state="setup"` при
  корректном Supabase.

Если `smoke:auth` не проходит из-за внешнего состояния Supabase, например
заблокированного тестового пользователя или отсутствия email service, это нужно
явно записать в итог.

## 7. Ручная проверка перед commit/push

После автоматических проверок Codex должен дать пользователю маршрут:

- открыть `/login`, войти администратором, преподавателем и учеником;
- открыть `/profile` и проверить имя, email, роль, организацию и выход;
- открыть `/admin`, `/teacher`, `/student` под соответствующими ролями;
- под учеником попробовать открыть `/admin` и `/teacher`, ожидать запрет или
  redirect без раскрытия данных;
- под преподавателем открыть только свои группы, учеников и журнал;
- открыть ключевые пустые списки и проверить понятный текст без технической
  ошибки;
- проверить, что при корректном Supabase нет `data-supabase-state="error"` и
  `data-supabase-state="setup"`.

## 8. Следующий stage

После merge этого stage:

`Release Candidate Smoke And Notes`
