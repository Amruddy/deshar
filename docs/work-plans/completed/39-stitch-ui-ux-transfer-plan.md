# План Release 1.0 Stitch UI/UX Transfer

## 0. Статус

- Статус плана: завершен, кодовая реализация выполнена.
- Большой блок: `Release 1.0`.
- Stage релиза: `Release Stage 11. Stitch UI/UX Transfer`.
- Рабочая ветка для реализации: `feat/stitch-ui-ux-transfer-implementation`.
- Предыдущий завершенный plan: `../completed/38-post-registration-performance-plan.md`.
- Roadmap релиза: `docs/roadmap/release-1-roadmap.md`.
- Связанные спецификации: `docs/specs/04-visual-rules.md`, `docs/specs/04-interface-by-role.md`, `docs/specs/01-functional-map.md`.
- Визуальный источник: локальные экспорты Google Stitch из `C:\Users\Mi\Downloads\stitch_project_interaction_guide.zip` и `C:\Users\Mi\Downloads\stitch_project_interaction_guide (1).zip`.

## 1. Цель

Перенести выбранное UI/UX-направление из Google Stitch в реальные страницы Deshar максимально близко к макетам: визуальный язык, layout, плотность, навигацию, карточки, таблицы, формы, состояния и mobile-поведение.

Stage не должен добавлять новую продуктовую функциональность. Он меняет только интерфейс существующих сценариев и сохраняет текущие роли, маршруты, права доступа, server-side data layer и бизнес-логику.

## 2. Правило по референсам Stitch

Stitch-экспорты являются локальными референсами и не коммитятся в GitHub.

Не коммитить:

- `public/stitch-exact/`;
- `app/stitch-test/`;
- PNG-скриншоты Stitch;
- HTML-файлы Stitch;
- ZIP-архивы Stitch;
- временные локальные страницы для просмотра референсов.

В репозиторий должны попасть только:

- production-код интерфейса;
- CSS/компоненты;
- обновления спецификаций или work plan;
- проверки и итоговые заметки stage.

## 3. Границы stage

Входит:

- привести дизайн-токены приложения к направлению Stitch: светлый зелено-серый фон, белые surface-блоки, академический зеленый primary, Inter, мягкие pill-формы;
- обновить app-shell: desktop sidebar, mobile navigation, пользовательский блок, активные состояния;
- обновить основные рабочие dashboard-страницы ролей: преподаватель, ученик, администратор, преподаватель-одиночка;
- обновить таблицы, списки, карточки метрик, статусные бейджи, формы, быстрые действия, empty/error/loading states;
- адаптировать mobile layout по мобильным Stitch-экранам;
- устранить наложения текста в плотных таблицах и списках;
- сохранить русскоязычный user-facing copy;
- выполнить автоматические проверки и локальный smoke.

Не входит:

- новая бизнес-логика;
- изменение маршрутов;
- изменение ролей и прав доступа;
- изменение Supabase schema, RLS, auth-flow или invite-flow;
- онлайн-оплата, загрузка файлов, новые отчеты;
- коммит локальных Stitch-референсов.

## 4. Рабочий порядок

1. Обновить `main` и создать ветку `feat/stitch-ui-ux-transfer`.
2. Зафиксировать активный plan и правило игнора локальных Stitch-референсов.
3. Сверить текущие страницы с Stitch-референсами и спецификациями.
4. Перенести базовые дизайн-токены и общие компоненты без изменения data layer.
5. Перенести app-shell desktop/mobile.
6. Перенести страницы преподавателя и журнал как основной рабочий сценарий.
7. Перенести страницы ученика.
8. Перенести страницы администратора и преподавателя-одиночки.
9. Проверить формы, таблицы, статусы, empty/error/loading states.
10. Выполнить автоматические проверки.
11. Выполнить локальную smoke-проверку.
12. Дать пользователю ручной smoke-маршрут перед commit/push.

## 5. Приоритеты переноса

Первый приоритет:

- `/teacher`;
- `/teacher/groups`;
- `/teacher/groups/[groupId]`;
- `/teacher/groups/[groupId]/journal`;
- `/teacher/lessons/[lessonId]`.

Второй приоритет:

- `/student`;
- `/student/schedule`;
- `/student/homework`;
- `/student/materials`;
- `/student/progress`;
- `/student/attendance`;
- `/student/payments`.

Третий приоритет:

- `/admin`;
- `/admin/courses`;
- `/admin/groups`;
- `/admin/students`;
- `/admin/teachers`;
- `/admin/payments`;
- `/login`;
- `/profile`;
- system states: `/forbidden`, `not-found`, `error`, `loading`.

## 6. Проверки

Минимальные автоматические проверки:

- `git diff --check`;
- `npm.cmd run lint`;
- `npm.cmd run build`;
- `npm.cmd run smoke:auth`;
- `npm.cmd run smoke:roles`.

Локальный smoke:

- открыть `/login`;
- войти в dev/smoke-режим или использовать доступный локальный сценарий;
- проверить `/teacher`, `/teacher/groups`, `/teacher/groups/[groupId]/journal`;
- проверить `/student`;
- проверить `/admin`;
- проверить mobile viewport для главных страниц ролей;
- убедиться, что таблицы не имеют наложения текста, а основные действия видны без лишней прокрутки.

## 7. Definition of Done

Stage завершен, если:

- ключевые страницы визуально соответствуют направлению Stitch;
- desktop и mobile layout работают без сломанных блоков;
- текущие сценарии ролей не потеряли функциональность;
- локальные Stitch PNG/HTML/ZIP не попали в Git;
- автоматические проверки прошли;
- Codex smoke выполнен;
- пользователь получил ручной smoke-маршрут и разрешил commit/push;
- после подтверждения stage закоммичен, запушен и plan перенесен в `docs/work-plans/completed/`.
