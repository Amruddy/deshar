# План Release 1.0 Performance Baseline And Supabase Optimization

## 0. Статус

- Статус плана: завершен, PR #61.
- Большой блок: `Release 1.0`.
- Stage релиза: `Release Stage 8. Performance Baseline And Supabase Optimization`.
- Рабочая ветка: `feat/performance-baseline-supabase`.
- Коммит stage: `f04b3ed`.
- Предыдущий завершенный plan: `../completed/35-release-candidate-smoke-and-notes-plan.md`.
- Roadmap релиза: `docs/roadmap/release-1-roadmap.md`.
- Техническая спецификация: `docs/specs/03-technical-specs/performance-and-supabase.md`.

## 1. Цель

Зафиксировать измеримый baseline быстродействия Release 1.0, найти самые
дорогие маршруты и Supabase-запросы, затем закрыть 2-4 заметных bottlenecks без
изменения бизнес-логики, auth-flow и визуального направления.

Stage должен ответить на четыре вопроса до оптимизаций:

- какие маршруты или действия медленные;
- причина в startup, server render, Supabase query time, количестве запросов,
  размере ответа, hydration/JS или мобильной интерактивности;
- какой baseline до правок;
- какой измеримый результат изменился после правок.

## 2. Источники правды

Перед кодом нужно читать:

- `docs/roadmap/README.md`;
- `docs/roadmap/release-1-roadmap.md`;
- `docs/specs/03-technical-specs/performance-and-supabase.md`;
- `docs/specs/03-technical-specs/production-auth.md`;
- `docs/specs/03-technical-specs/data-model.md`;
- `docs/specs/03-technical-specs/pages-and-routes.md`;
- `docs/specs/03-technical-specs/permissions.md`;
- `docs/specs/03-technical-specs/states-and-validation.md`;
- `docs/specs/02-feature-specs/calendar-journal.md`;
- `docs/specs/02-feature-specs/attendance.md`;
- `docs/specs/02-feature-specs/payments.md`;
- `docs/release/release-1-release-candidate.md`;
- `C:/Users/Mi/.codex/skills/mobile-performance-optimizer/SKILL.md`.

## 3. Что входит

### 3.1. Baseline до изменений

- Выполнить production build.
- Запустить локальный production server через `next start` или эквивалент.
- Измерить HTTP timings ключевых маршрутов из performance spec:
  `/login`, `/admin`, `/admin/groups`, `/admin/students`, `/teacher`,
  `/teacher/groups`, `/teacher/groups/[groupId]/journal`,
  `/teacher/attendance`, `/student`, `/student/attendance`.
- Для каждого маршрута зафиксировать status code, redirect, server response
  time, размер HTML и наличие `data-supabase-state="error"` или
  `data-supabase-state="setup"`.
- Если instrumentation уже есть или добавляется в stage, зафиксировать
  количество Supabase-запросов, суммарное время Supabase и самый медленный
  запрос.

### 3.2. Локальная instrumentation, если нужна

- Допускается добавить server-only instrumentation за флагом
  `DESHAR_PERF_LOG=1`.
- Логи должны быть выключены по умолчанию.
- Логи не должны содержать secrets, персональные данные учеников или полный
  payload запросов.
- При выключенном флаге приложение не должно писать perf-логи.

### 3.3. Supabase query audit

- Проверить `app/lib/data/*` и `app/lib/supabase/*` на повторные Supabase
  clients, повторный session/profile resolver, `select("*")`, N+1,
  неограниченные списки и лишние sequential waterfalls.
- Сравнить текущую SQL-схему с индексами из performance spec.
- Не добавлять дублирующие индексы.
- Не менять security boundary: приватные учебные данные остаются за server-side
  data-layer, без прямого browser-side чтения Supabase.

### 3.4. Точечные оптимизации

После baseline выбрать 2-4 bottlenecks с максимальным эффектом.

Приоритетные кандидаты:

- `/teacher/groups/[groupId]/journal`;
- `/teacher/attendance`;
- admin dashboard и списки;
- `/admin/students`;
- `/admin/groups`;
- student cabinet.

Допустимые типы правок:

- batch-запросы вместо N+1;
- `.select(...)` только нужных колонок;
- `limit`, `range`, фильтр месяца, группы, статуса или периода;
- `Promise.all` для независимых server-side чтений;
- перенос повторяющейся сборки view-model в data-layer;
- недостающие составные индексы под реальные запросы;
- lazy/conditional mount тяжелых клиентских блоков, если измерения покажут
  frontend bottleneck.

### 3.5. Итоговый performance report

Создать или обновить документ:

`docs/release/release-1-performance-baseline.md`

В нем зафиксировать:

- baseline до изменений;
- выбранные bottlenecks;
- выполненные оптимизации;
- сравнение baseline vs result;
- оставшиеся hotspots;
- ограничения измерений, если локальный Supabase или seed не отражают
  production нагрузку.

## 4. Что не входит

- Новая продуктовая функциональность.
- Новый redesign или визуальный restyle.
- Изменение production auth flow.
- Публичная регистрация, OAuth, SSO, MFA.
- Онлайн-оплата или billing-интеграции.
- Прямое чтение приватных таблиц Supabase из браузера без отдельного RLS/security
  stage.
- Production deploy, домен, backup-политика и мониторинг.
- Массовая переработка схемы данных без отдельного плана.
- Удаление учебной истории ради ускорения.
- Отключение проверок прав ради скорости.

## 5. Рабочий порядок

1. Проверить актуальный `main`, ветку stage и источники правды.
2. Осмотреть app shell, ключевые route loaders, data-layer и smoke scripts.
3. Собрать production build.
4. Запустить production server и снять baseline ключевых маршрутов.
5. По baseline выбрать 2-4 bottlenecks.
6. Перед правками кратко зафиксировать, какие файлы и почему меняются.
7. Вносить маленькие изменения, каждое привязывать к измеренному bottleneck.
8. Повторить измерения и сравнить результат.
9. Обновить `docs/release/release-1-performance-baseline.md`.
10. Выполнить проверки и дать пользователю ручной маршрут перед commit/push.

## 6. Проверки

После реализации выполнить:

- `git diff --check`;
- `npm.cmd run lint`;
- `npm.cmd run build`;
- `npm.cmd run smoke:roles`;
- `npm.cmd run smoke:auth`, если stage затронет auth/session/Supabase helpers;
- локальный production HTTP-smoke ключевых маршрутов из baseline;
- проверку, что при выключенном `DESHAR_PERF_LOG` perf-логи не пишутся, если
  instrumentation была добавлена;
- проверку, что ключевые страницы не показывают
  `data-supabase-state="error"` или `data-supabase-state="setup"` при
  корректной настройке Supabase.

Если `smoke:auth` или Supabase-зависимые измерения не проходят из-за внешнего
состояния dev Supabase, это нужно явно записать в итог.

## 7. Ручная проверка перед commit/push

После автоматических проверок Codex должен дать пользователю маршрут:

- открыть `/login`, войти администратором, преподавателем и учеником;
- открыть `/admin`, `/admin/groups`, `/admin/students`;
- открыть `/teacher`, `/teacher/groups`, группу преподавателя, журнал группы и
  `/teacher/attendance`;
- открыть `/student` и `/student/attendance`;
- проверить, что страницы открываются без визуальных ошибок и без
  `data-supabase-state="error"` / `data-supabase-state="setup"`;
- проверить, что журнал и посещаемость показывают данные выбранного периода, а
  не всю историю;
- если добавлена instrumentation, убедиться, что perf-логи появляются только
  при `DESHAR_PERF_LOG=1`.

## 8. Definition of Done

Stage считается завершенным, если:

- baseline до изменений зафиксирован;
- выбранные bottlenecks основаны на измерениях;
- изменения не расширяют product-scope;
- security boundaries production auth сохранены;
- результат измерений после правок зафиксирован;
- оставшиеся hotspots перечислены;
- автоматические проверки прошли или их внешний blocker явно описан;
- пользователь получил ручной маршрут проверки перед commit/push.

## 9. Следующий stage

После merge этого stage следующий шаг выбирается по результатам performance
report:

- отдельный RLS/security stage, если понадобится browser-side доступ к данным;
- infrastructure/deploy stage, если основная задержка связана с регионом,
  hosting или Supabase-планом;
- следующий performance stage, если останутся измеренные hotspots.
