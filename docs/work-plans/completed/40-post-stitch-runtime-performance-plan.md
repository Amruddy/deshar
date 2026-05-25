# План Release 1.0 Post-Stitch Runtime Performance

## 0. Статус

- Статус плана: завершен, PR #67.
- Большой блок: `Release 1.0`.
- Stage релиза: `Release Stage 12. Post-Stitch Runtime Performance`.
- Рабочая ветка: `feat/runtime-performance-after-stitch`.
- Предыдущий завершенный plan: `../completed/39-stitch-ui-ux-transfer-plan.md`.
- Roadmap релиза: `docs/roadmap/release-1-roadmap.md`.
- Техническая спецификация: `docs/specs/03-technical-specs/performance-and-supabase.md`.
- Визуальная основа: завершенный Stitch UI/UX Transfer stage.

## 1. Цель

Ускорить реальные рабочие страницы после переноса Stitch UI/UX без нового redesign,
без изменения ролей, auth-flow и product-scope.

Пользовательский симптом: после визуального переноса интерфейс нужно довести по
быстродействию, особенно на рабочих маршрутах преподавателя и ученика.

Stage должен сначала измерить baseline, затем выбрать 2-4 самых заметных
bottleneck и закрыть их точечными правками.

## 2. Источники правды

Перед кодом читать:

- `docs/roadmap/README.md`;
- `docs/roadmap/release-1-roadmap.md`;
- `docs/work-plans/active/README.md`;
- `docs/specs/03-technical-specs/performance-and-supabase.md`;
- `docs/specs/04-interface-by-role.md`;
- `docs/specs/04-visual-rules.md`;
- `C:/Users/Mi/.codex/skills/mobile-performance-optimizer/SKILL.md`.

## 3. Что входит

- production build и baseline ключевых маршрутов через `npm.cmd run perf:baseline`;
- аудит app shell, CSS после Stitch, тяжелых server loaders и больших HTML-ответов;
- сокращение лишних server-side чтений, waterfall и повторных вычислений;
- ограничение тяжелых списков, если они грузят больше данных, чем нужно для
  первого экрана;
- уменьшение HTML/CSS/runtime-cost без удаления нужной информации;
- обновление performance report по результатам.

## 4. Что не входит

- новый visual redesign;
- новая продуктовая функциональность;
- изменение production auth, ролей или прав доступа;
- прямое чтение приватных Supabase-данных из браузера;
- онлайн-оплата, billing, deploy, домен, SMTP;
- массовая переработка схемы данных без отдельного плана;
- отключение проверок прав ради скорости.

## 5. Рабочий порядок

1. Убедиться, что работа идет не в `main`.
2. Снять production baseline ключевых маршрутов после Stitch UI.
3. Определить главные bottlenecks: server response, HTML bytes, Supabase state,
   тяжелый CSS/markup или route loader.
4. Внести минимальные точечные оптимизации.
5. Повторить baseline и сравнить результат.
6. Обновить `docs/release/release-1-post-stitch-performance.md`.
7. Выполнить проверки.
8. Дать пользователю ручной smoke-маршрут перед commit/push.

## 6. Проверки

Минимум:

- `git diff --check`;
- `npm.cmd run lint`;
- `npm.cmd run build`;
- `npm.cmd run perf:baseline`;
- `npm.cmd run smoke:roles`;
- `npm.cmd run smoke:auth`, если stage затронет auth/session/Supabase helpers.

Если локальный Supabase или production server недоступны, blocker фиксируется в
итоге, но кодовые проверки все равно выполняются.

## 7. Ручная проверка перед commit/push

После автоматических проверок открыть:

- `/login`;
- `/teacher`;
- `/teacher/groups`;
- `/teacher/groups/[groupId]`;
- `/teacher/groups/[groupId]/journal`;
- `/teacher/attendance`;
- `/student`;
- `/student/attendance`;
- `/admin`.

Ожидаемый результат: страницы открываются без `data-supabase-state="error"` и
без визуальных зависаний, мобильная навигация остается доступной, журнал и
посещаемость показывают данные текущего периода.

## 8. Definition of Done

Stage завершен, если:

- baseline до изменений зафиксирован;
- выбранные bottlenecks основаны на измерениях;
- изменения не расширяют product-scope;
- результат после изменений зафиксирован;
- оставшиеся hotspots перечислены;
- автоматические проверки прошли или blocker явно описан;
- пользователь получил ручной маршрут проверки перед commit/push.

## 9. Текущий результат

Baseline и результат зафиксированы в:

`docs/release/release-1-post-stitch-performance.md`

Ключевой результат после первых правок:

- `/teacher/groups/[groupId]/journal`: `13245 ms` -> `1413 ms`;
- `/teacher`: `2822 ms` -> `1413 ms`;
- `/teacher/groups`: `2137 ms` -> `1125 ms`;
- `/teacher/attendance`: `2201 ms` -> `1406 ms`;
- `/student`: `5134 ms` -> `1966 ms`;
- `/student/attendance`: `3153 ms` -> `1915 ms`.
