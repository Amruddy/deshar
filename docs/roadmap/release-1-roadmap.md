# Release 1.0 Roadmap

# Roadmap релизной версии Deshar

## 1. Назначение

`Release 1.0` - следующий большой блок после завершения `MPMF 1.0`.

Цель блока - довести продукт до состояния, где им можно пользоваться как реальной системой: с настоящими аккаунтами, понятными ролями, финальным UI/UX, проверенными ограничениями и release-кандидатом.

`MPMF 1.0` доказал рабочий состав функций. `Release 1.0` должен превратить эту основу в более законченный продукт.

## 2. Источники правды

- `docs/roadmap/README.md`;
- `docs/roadmap/production-auth-and-real-accounts-roadmap.md`;
- `docs/specs/`;
- `docs/specs/03-technical-specs/production-auth.md`;
- `docs/specs/04-visual-rules.md`;
- `docs/release/mpmf-1-release-readiness.md`;
- активный план из `docs/work-plans/active/README.md`.

## 3. Принципы Release 1.0

- Не смешивать крупные направления в одном stage.
- Сначала завершить реальные аккаунты и auth-flow.
- После auth-flow выполнить отдельный финальный UI/UX redesign.
- Не считать текущий UI финальным: шрифты, размеры, плотность блоков, таблицы, кнопки, карточки и навигация должны быть отдельно пересмотрены.
- Каждый stage должен иметь work plan, проверки, commit, push и историю в completed plans.

## 4. Stages Release 1.0

### Release Stage 1. Release Roadmap Setup

Цель:

зафиксировать `Release 1.0` как верхний большой блок после `MPMF 1.0`.

Входит:

- создание этого roadmap;
- перенос подготовительного auth-plan в completed;
- выбор следующего active work plan;
- фиксация обязательного будущего этапа финального дизайна.

Не входит:

- runtime-код;
- миграции;
- изменение UI.

### Release Stage 2. Production Auth And Real Accounts

Статус:

завершен, PR #52.

Цель:

заменить dev-auth настоящими аккаунтами Supabase Auth.

Состав подплана:

- `Auth Stage 2. Supabase Auth Session Foundation`;
- `Auth Stage 3. Account Linking And Schema`;
- `Auth Stage 4. Admin Invitations`;
- `Auth Stage 5. Auth Smoke And Hardening`.

Результат:

- админ, преподаватель и ученик входят через реальные учетные данные;
- приглашения отправляются реальным email через Supabase Auth;
- пользователь сам задает пароль;
- dev-auth остается только как локальный инструмент разработки.

### Release Stage 3. Final Design System And UX Polish

Статус:

активный stage.

Цель:

сделать интерфейс визуально более зрелым, удобным и приятным для ежедневной работы.

Обязательный фокус:

- более спокойная и цельная визуальная система;
- менее громоздкие блоки и формы;
- более аккуратная плотность таблиц и списков;
- пересмотр размеров шрифтов, жирности, высоты строк и отступов;
- единый вид кнопок, фильтров, модальных окон и действий;
- читаемые списки учеников, групп, преподавателей и оплат;
- mobile/desktop polish после появления реального auth-flow.

Правило:

финальный redesign выполняется отдельным stage после production auth, чтобы дизайн опирался на реальные экраны входа, приглашений, ролей и рабочих областей.

### Release Stage 4. Production Hardening

Цель:

подготовить продукт к стабильному использованию.

Входит:

- проверка env/config;
- hardening ошибок и пустых состояний;
- проверка закрытых маршрутов;
- проверка service-role/server-only ограничений;
- обновление release limitations.

### Release Stage 5. Release Candidate Smoke And Notes

Цель:

собрать release candidate и финальную историю готовности.

Входит:

- полный smoke admin/teacher/student;
- auth smoke;
- основные бизнес-сценарии: группы, журнал, прогресс, задания, оплаты;
- список известных ограничений;
- финальные release notes.

## 5. Следующий stage

Следующий кодовый stage:

`Final Design System And UX Polish`
