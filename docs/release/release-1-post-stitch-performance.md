# Release 1.0 Post-Stitch Performance

Дата: 2026-05-25.

Ветка stage: `feat/runtime-performance-after-stitch`.

## 1. Цель

После переноса Stitch UI/UX проверить runtime-быстродействие ключевых маршрутов
и убрать самые заметные bottlenecks без нового redesign, изменения ролей,
auth-flow или product-scope.

## 2. Baseline до изменений

Команда:

`PERF_BASE_URL=http://127.0.0.1:3007 PERF_AUTH_MODE=supabase PERF_SAMPLES=1 PERF_WARMUPS=0 npm.cmd run perf:baseline`

Примечание: скрипт всегда делает минимум один warmup.

| Route | Status | Median ms | HTML bytes | State |
|---|---:|---:|---:|---|
| `/login` | 200 | 9 | 22525 | ready |
| `/admin` | 200 | 1527 | 23805 | ready |
| `/admin/groups` | 200 | 2245 | 30506 | ready |
| `/admin/students` | 200 | 1667 | 29545 | ready |
| `/teacher` | 200 | 2822 | 25758 | ready |
| `/teacher/groups` | 200 | 2137 | 24240 | ready |
| `/teacher/groups/[groupId]/journal` | 200 | 13245 | 75886 | ready |
| `/teacher/attendance` | 200 | 2201 | 47549 | ready |
| `/student` | 200 | 5134 | 21399 | ready |
| `/student/attendance` | 200 | 3153 | 19221 | ready |

## 3. Диагноз

- Главный bottleneck: `/teacher/groups/[groupId]/journal`. Loader загружал
  progress records, homework и materials только ради `indicators`, но текущий
  `JournalGrid` эти индикаторы не отображает.
- Журнал также повторно проверял/загружал уроки месяца: сначала внутри
  materialization-проверки, потом отдельным запросом для view-model.
- `/student` и `/student/attendance` использовали общий
  `getBaseOrganizationData`, который грузит данные всей организации, хотя
  ученику нужны только его активные группы, курсы и, для главной, преподаватели.
- `/teacher`, `/student` и `/student/attendance` повторно искали пользователя
  по email, хотя protected page уже получила внутренний `userId` из
  `requireWorkspace`.
- `/student/attendance` делал два зависимых запроса: сначала последние уроки,
  затем `journal_entries` по этим урокам. Экран в итоге показывает только
  отмеченные записи, поэтому эти данные можно получать одним joined-запросом.

## 4. Изменения

- Журнал группы теперь читает только данные, которые реально нужны таблице:
  группу, расписание, курс, уроки месяца, активных учеников и сохраненные
  отметки журнала.
- Запрос `journal_entries` для журнала сокращен до колонок
  `id`, `lesson_id`, `student_id`, `attendance_mark`, `lesson_mark`.
- Проверка создания уроков по расписанию переиспользует уже загруженные уроки
  месяца и не делает второй запрос, если ничего создавать не нужно.
- Добавлен узкий `getStudentLearningContext` для ученических страниц: он грузит
  только ученика, его активные группы, связанные курсы и при необходимости
  преподавателей.
- `/student` и `/student/attendance` переведены на узкий student-context loader.
- Обзор ученика ограничивает оплату текущего ученика организацией и `limit(5)`.
- `/teacher`, `/student` и `/student/attendance` используют `session.userId`
  вместо повторного поиска пользователя по email.
- `/student/attendance` получает уроки и запись журнала ученика одним
  `lessons + journal_entries!inner` запросом.
- `/student/schedule` переведен на узкий student-context loader и больше не
  грузит всю организацию ради расписания одного ученика.
- `/teacher/groups` и `/teacher/attendance` убирают лишний waterfall: курсы
  загружаются параллельно с составом групп, уроками и связанными данными.
- `/teacher/attendance`, `/teacher` и страница группы преподавателя читают из
  `journal_entries` только поля, нужные для расчета посещаемости.
- `/teacher/groups/[groupId]` больше не загружает всю организацию и повторно не
  ищет преподавателя по email: страница читает одну группу, ее курс, активный
  состав, связанные платежи, материалы, расписание и уроки.

## 5. Result после изменений

Команда:

`PERF_BASE_URL=http://127.0.0.1:3007 PERF_AUTH_MODE=supabase PERF_SAMPLES=3 PERF_WARMUPS=1 npm.cmd run perf:baseline`

| Route | Before ms | After median ms | Delta ms | HTML bytes | State |
|---|---:|---:|---:|---:|---|
| `/login` | 9 | 15 | +6 | 22525 | ready |
| `/admin` | 1527 | 1099 | -428 | 23805 | ready |
| `/admin/groups` | 2245 | 1419 | -826 | 30506 | ready |
| `/admin/students` | 1667 | 1160 | -507 | 29545 | ready |
| `/teacher` | 2822 | 1413 | -1409 | 25758 | ready |
| `/teacher/groups` | 2137 | 1125 | -1012 | 24240 | ready |
| `/teacher/groups/[groupId]/journal` | 13245 | 1413 | -11832 | 75886 | ready |
| `/teacher/attendance` | 2201 | 1406 | -795 | 47549 | ready |
| `/student` | 5134 | 1966 | -3168 | 21399 | ready |
| `/student/attendance` | 3153 | 1915 | -1238 | 19221 | ready |

## 6. Оставшиеся hotspots

- `/student/attendance` теперь держится около целевого ориентира по median.
  Следующий шаг при повторении сетевых выбросов - route-level Supabase
  instrumentation или проверка региона/latency Supabase.
- HTML ответа журнала остается около `75 KB`, потому что календарная таблица
  передает все ячейки месяца. Это уже не главный server bottleneck, но может быть
  отдельной mobile/runtime задачей.
- Админские маршруты ускорились относительно исходного baseline, но не были
  целью второго прохода. Если дальше ускорять именно админа, нужно отдельно
  разбирать `getBaseOrganizationData` на detail/list loaders.
- Замеры выполнены на локальном production server и dev Supabase; это не
  production SLA.

## 7. Проверки

Выполнено на момент отчета:

- `npm.cmd run build` - прошел;
- `npm.cmd run perf:baseline` на `http://127.0.0.1:3007` - прошел, все routes
  вернули `ready`, samples `3`, warmup `1`;
- `git diff --check` - прошел;
- `npm.cmd run lint` - прошел с прежним warning в локальном `app/stitch-test/page.tsx`.
- `DESHAR_ENABLE_DEV_AUTH=0 SMOKE_BASE_URL=http://127.0.0.1:3007 npm.cmd run smoke:auth` - прошел на production server;
- `SMOKE_BASE_URL=http://127.0.0.1:3008 npm.cmd run smoke:roles` - прошел на
  временном dev server, проверено 37 маршрутов.

Примечание: первая попытка `smoke:auth` без явного `DESHAR_ENABLE_DEV_AUTH=0`
упала на проверке видимости dev-auth, потому что `next start` работает в
production-режиме и скрывает dev-вход. Повтор с явным production-флагом прошел.
Первый sandbox-запуск `next dev` для `smoke:roles` упал с `spawn EPERM`; повтор
с техническим escalated-запуском временного dev server на `3008` прошел.
