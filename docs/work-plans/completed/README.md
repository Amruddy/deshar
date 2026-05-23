# Completed Plans

Сюда записываются завершенные этапы разработки.

## Завершенные этапы

- `03-remove-legacy-database-layer-plan.md` - удаление старого Prisma/local DB слоя.
- `04-supabase-foundation-plan.md` - подключение Supabase, schema/seed и базовый data-layer.
- `05-admin-crud-foundation-plan.md` - базовые формы администратора для курсов, учеников, групп и назначений.
- `06-mpmf-1-spec-rewrite-plan.md` - переписывание спецификаций под `MPMF 1.0`.
- `07-mpmf-1-implementation-roadmap-plan.md` - roadmap реализации `MPMF 1.0`.
- `08-mpmf-1-stage-1-admin-group-detail-plan.md` - административная карточка группы.
- `09-mpmf-1-stage-2-group-schedule-lessons-plan.md` - расписание группы и создание занятий.
- `10-mpmf-1-stage-3-teacher-groups-plan.md` - рабочие страницы групп преподавателя.
- `11-mpmf-1-stage-4-calendar-journal-plan.md` - календарный журнал группы.
- `12-mpmf-1-stage-5-lesson-page-plan.md` - страница конкретного урока.
- `13-mpmf-1-entry-page-plan.md` - публичная входная страница `/` и `/login`.
- `14-mpmf-1-stage-6-tajweed-progress-plan.md` - прогресс таджвида.
- `15-mpmf-1-stage-7-homework-materials-plan.md` - домашние задания и материалы.
- `16-mpmf-1-stage-8-student-dashboard-schedule-plan.md` - первый экран и расписание ученика.
- `17-mpmf-1-stage-9-student-learning-cabinet-plan.md` - учебный кабинет ученика.
- `18-mpmf-1-stage-10-payments-plan.md` - ручной учет оплат, read-only просмотры оплат и платежные сигналы.
- `19-mpmf-1-stage-11-admin-entity-completeness-plan.md` - завершение административных сущностей MPMF 1.0.
- `20-mpmf-1-stage-12-access-empty-states-errors-plan.md` - права доступа, пустые состояния и страницы ошибок MPMF 1.0.
- `21-mpmf-1-stage-13-mass-payment-creation-plan.md` - единое добавление оплаты группе или одному ученику, редактирование деталей оплат и смена статуса из общего списка.
- `22-mpmf-1-stage-14-cross-role-smoke-flow-plan.md` - автоматический smoke-check основных маршрутов администратора, преподавателя и ученика.
- `23-mpmf-1-stage-15-mobile-ux-polish-plan.md` - mobile/UX polish рабочих экранов, таблиц, журнала, форм и общих UI-паттернов.
- `24-mpmf-1-stage-16-release-hardening-plan.md` - финальный hardening MPMF 1.0, release readiness и известные ограничения.
- `25-production-auth-real-accounts-plan.md` - подготовка production-auth блока: specs, roadmap, real Supabase invite flow и решения по реальным аккаунтам.
- `26-release-1-roadmap-setup-plan.md` - оформление `Release 1.0` как верхнего релизного блока, перенос active plan и фиксация будущего финального UI/UX stage.
- `27-auth-stage-2-supabase-auth-session-foundation-plan.md` - основа Supabase Auth session: SSR/client helpers, callback, login/logout/password reset, profile, dev-auth fallback по флагу и таймауты Supabase.
- `28-auth-stage-3-account-linking-schema-plan.md` - связь Supabase Auth user с доменной таблицей `users`: `auth_user_id`, `auth_status`, SQL-инструкция, seed/dev users и session resolver через активный профиль и членство.
- `29-auth-stage-4-admin-invitations-plan.md` - админские приглашения преподавателей и учеников через Supabase Auth Admin API, повторная отправка, отключение доступа и статусы доступа в админских списках.
- `30-auth-stage-5-auth-smoke-hardening-plan.md` - auth smoke и hardening production-auth flow: реальные Supabase Auth аккаунты, logout, запрет чужих рабочих областей и disabled-профиль.
- `31-final-design-system-ux-polish-plan.md` - финальный UI/UX polish после production auth: дизайн-система, плотность интерфейса, loading states, таблицы, формы и smoke hardening для Supabase error-state.
- `32-new-visual-design-plan.md` - новый целостный визуальный дизайн приложения, project design skill и перенос реальных страниц на утвержденное визуальное направление.
- `01-initial-product-implementation-plan.md` - исторический план первой рабочей реализации.
- `02-system-a-ui-implementation-plan.md` - исторический план UI-направления System A.

## Формат будущей записи

- какой этап выполнен;
- что было сделано;
- какие файлы или части приложения изменены;
- какие проверки прошли;
- какой коммит соответствует этапу;
- что остается на следующий этап.
