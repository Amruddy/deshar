# Release 1.0 Performance Baseline

## 1. Статус

Документ фиксирует результат stage
`Release 1.0 Performance Baseline And Supabase Optimization`.

Рабочая ветка:

`feat/performance-baseline-supabase`

Дата локальных измерений:

2026-05-23

## 2. Метод измерения

Измерения выполнялись на production-сборке:

- `npm.cmd run build`;
- `npm.cmd run start -- --hostname 127.0.0.1 --port 3010`;
- `$env:PERF_BASE_URL = "http://127.0.0.1:3010"; npm.cmd run perf:baseline`.

Baseline script использует Supabase Auth smoke-аккаунты
`admin@example.test`, `teacher@example.test`, `student@example.test` и
временный smoke-пароль из `DESHAR_AUTH_SMOKE_PASSWORD` или значение по
умолчанию `DesharSmoke123!`.

Для каждого маршрута фиксировались:

- HTTP status;
- redirect target;
- median/min/max response time;
- размер HTML;
- наличие `data-supabase-state="error"` или `data-supabase-state="setup"`.

Ограничение измерения: это локальный dev Supabase и локальный production server,
не production SLA. Значения чувствительны к сетевой задержке Supabase.

## 3. Baseline до оптимизаций

| Route | Status | Redirect | Median ms | Min/Max ms | HTML bytes | State |
|---|---:|---|---:|---:|---:|---|
| `/login` | 200 | - | 7 | 6/8 | 16814 | ready |
| `/admin` | 200 | - | 2508 | 2434/3493 | 24427 | ready |
| `/admin/groups` | 200 | - | 3781 | 3471/4122 | 30244 | ready |
| `/admin/students` | 200 | - | 3484 | 3072/3861 | 29275 | ready |
| `/teacher` | 200 | - | 3913 | 3695/4502 | 23243 | ready |
| `/teacher/groups` | 200 | - | 5025 | 5009/5454 | 24389 | ready |
| `/teacher/groups/[groupId]/journal` | 200 | - | 18246 | 3346/19842 | 75652 | ready |
| `/teacher/attendance` | 200 | - | 2265 | 2246/2468 | 48923 | ready |
| `/student` | 200 | - | 2648 | 2428/3032 | 21137 | ready |
| `/student/attendance` | 200 | - | 3218 | 3180/4937 | 18943 | ready |

Главные bottlenecks:

- `/teacher/groups/[groupId]/journal` - самый тяжелый route, median 18246 ms;
- `/teacher/groups` - median 5025 ms;
- `/teacher` и admin/student списки - 2.5-4.0 s, в основном из-за нескольких
  server-side Supabase round trips.

## 4. Выполненные оптимизации

### 4.1. Воспроизводимый baseline script

Добавлен script:

`npm.cmd run perf:baseline`

Он:

- входит через Supabase Auth smoke-аккаунты;
- измеряет ключевые маршруты Release 1.0;
- выводит Markdown и JSON;
- фиксирует Supabase setup/error markers;
- поддерживает fallback `PERF_AUTH_MODE=dev-cookie` для dev-server сценариев.

### 4.2. Teacher groups

`/teacher/groups` больше не загружает всю организацию через общий
`getBaseOrganizationData`.

Изменения:

- используется `session.userId` вместо повторного поиска пользователя по email;
- загружаются только группы текущего преподавателя;
- курсы ограничены `course_id` этих групп;
- будущие уроки ограничены рабочим лимитом;
- оплаты для проблемных признаков ограничены статусами `pending` и `overdue`.

### 4.3. Teacher attendance

`/teacher/attendance` больше не загружает всех учеников организации.

Изменения:

- используется `session.userId`;
- загружаются только группы текущего преподавателя;
- ученики загружаются только по активным связям выбранных групп;
- журнал по-прежнему ограничен выбранным месяцем.

### 4.4. Teacher group journal

`/teacher/groups/[groupId]/journal` больше не загружает всю организацию и все
активные материалы организации.

Изменения:

- используется `session.userId` и имя из session;
- группа, курс, ученики и расписание загружаются точечно;
- `ensureTeacherGroupLessonsForMonth` переиспользует уже загруженные правила
  расписания;
- материалы журнала загружаются только по `lesson_id` и `homework_id` выбранного
  месяца;
- active students загружаются только из состава текущей группы.

## 5. Result после оптимизаций

| Route | Status | Redirect | Median ms | Min/Max ms | HTML bytes | State |
|---|---:|---|---:|---:|---:|---|
| `/login` | 200 | - | 9 | 7/15 | 16814 | ready |
| `/admin` | 200 | - | 2261 | 1933/3162 | 24427 | ready |
| `/admin/groups` | 200 | - | 2569 | 2499/6074 | 28546 | ready |
| `/admin/students` | 200 | - | 2301 | 2213/3532 | 29275 | ready |
| `/teacher` | 200 | - | 2885 | 2207/3997 | 23243 | ready |
| `/teacher/groups` | 200 | - | 2345 | 2270/2637 | 24389 | ready |
| `/teacher/groups/[groupId]/journal` | 200 | - | 2933 | 2884/3070 | 75652 | ready |
| `/teacher/attendance` | 200 | - | 2272 | 2158/2400 | 48923 | ready |
| `/student` | 200 | - | 2656 | 2461/2701 | 21137 | ready |
| `/student/attendance` | 200 | - | 2927 | 2660/3084 | 18943 | ready |

## 6. Сравнение

| Route | Before median | After median | Изменение |
|---|---:|---:|---:|
| `/teacher/groups` | 5025 ms | 2345 ms | -53% |
| `/teacher/groups/[groupId]/journal` | 18246 ms | 2933 ms | -84% |
| `/teacher` | 3913 ms | 2885 ms | -26% |
| `/admin/groups` | 3781 ms | 2569 ms | -32% |
| `/admin/students` | 3484 ms | 2301 ms | -34% |
| `/student/attendance` | 3218 ms | 2927 ms | -9% |

Самый важный результат stage: журнал преподавателя ушел из критической зоны
18-20 секунд в диапазон около 3 секунд на локальном Supabase.

## 7. Оставшиеся hotspots

- Все protected routes все еще платят стоимость Supabase Auth/session resolver и
  нескольких server-side round trips.
- `/teacher/attendance` остался около 2.3 s: следующий выигрыш возможен через
  дальнейшее сокращение запросов и/или агрегирование посещаемости.
- Admin routes все еще используют широкие выборки организации в части loaders.
- Student routes все еще используют общий `getBaseOrganizationData` и могут быть
  следующим кандидатом для targeted loaders.
- Инфраструктурная задержка Supabase region/hosting не проверялась.

## 8. Индексы

Новые индексы в этом stage не добавлялись. В текущей схеме уже есть базовые
индексы для задействованных запросов:

- `idx_lessons_organization_starts_at`;
- `idx_lessons_group_starts_at`;
- `idx_group_students_group_id`;
- `idx_group_students_student_id`;
- `idx_schedule_rules_group_target`;
- `idx_payments_organization_status`;
- `idx_payments_group_id`.

Перед добавлением новых индексов нужен отдельный query-plan pass или Supabase
SQL диагностика, чтобы не создавать дубликаты.

## 9. Проверки stage

Автоматические проверки:

- `git diff --check` - пройдено;
- `npm.cmd run lint` - пройдено;
- `npm.cmd run build` - пройдено;
- `$env:PERF_BASE_URL = "http://127.0.0.1:3010"; npm.cmd run perf:baseline` - пройдено;
- `$env:SMOKE_BASE_URL = "http://127.0.0.1:3010"; $env:DESHAR_ENABLE_DEV_AUTH = "0"; npm.cmd run smoke:auth` - пройдено;
- `$env:SMOKE_BASE_URL = "http://127.0.0.1:3011"; $env:DESHAR_ENABLE_DEV_AUTH = "1"; npm.cmd run smoke:roles` - пройдено.

`smoke:roles` выполнялся на отдельном `next dev`, потому что этот smoke
проверяет dev-cookie матрицу ролей. Production smoke выполнялся через Supabase
Auth и подтверждает, что dev-auth скрыт при production-сервере.
