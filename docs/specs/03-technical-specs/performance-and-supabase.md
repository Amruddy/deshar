# Performance And Supabase

# Быстродействие приложения и Supabase

## 1. Назначение

Этот документ фиксирует технические правила быстродействия Deshar.

Цель спецификации - сделать будущие оптимизации управляемыми: сначала измерить
узкие места, затем ускорять загрузку страниц, серверные чтения, работу Supabase
и тяжелые учебные экраны без смешивания с product-scope, redesign или release
candidate smoke.

Спецификация обязательна для этапов, которые меняют:

- `app/lib/supabase/*`;
- `app/lib/data/*`;
- server actions;
- SQL-схему, seed, индексы и миграции Supabase;
- страницы с тяжелой серверной загрузкой;
- журнал, посещаемость, оплаты, admin dashboard и списки;
- smoke-скрипты или будущие performance-smoke скрипты.

## 2. Главный принцип

Оптимизация выполняется только после измерения.

Запрещено начинать performance stage с широкого рефакторинга без ответа на
четыре вопроса:

- какая страница или действие медленное;
- это startup, server render, Supabase query time, количество запросов, размер
  HTML, hydration/JS или мобильная интерактивность;
- какой текущий baseline;
- какой измеримый результат должен измениться после правки.

Если метрика не измерена, правка считается предположением и не должна смешиваться
с release-stage.

## 3. Что входит в performance scope

Входит:

- уменьшение количества Supabase-запросов на страницу;
- устранение N+1 запросов;
- добавление нужных PostgreSQL индексов;
- выбор только нужных колонок в `.select(...)`;
- ограничение больших списков через `limit`, `range`, месяц, группу, статус или
  другой рабочий фильтр;
- параллельный запуск независимых server-side чтений;
- перенос повторяющейся сборки view-model в data-layer;
- сокращение server render time на тяжелых маршрутах;
- ускорение первого открытия мобильных рабочих экранов;
- future performance-smoke для регрессий.

Не входит:

- изменение product-scope без отдельной спеки;
- новый redesign;
- онлайн-оплата;
- перенос на другую БД;
- прямое использование Prisma/local DB;
- client-side доступ к приватным таблицам без отдельного RLS/security stage;
- production deploy, домен, backup-политика и мониторинг, если они не выделены
  отдельным infrastructure stage.

## 4. Базовая архитектура данных

Активная база данных проекта - Supabase.

Текущий путь чтения:

```text
Next.js Server Components / Server Actions
-> app/lib/data/*
-> app/lib/supabase/*
-> Supabase
```

Правила:

- страницы не обращаются к Supabase напрямую, если для этого есть data-layer;
- компоненты получают готовую view-model, а не сырые таблицы;
- один route-loader должен собирать данные страницы в одном месте;
- server actions повторно проверяют пользователя, организацию, роль и объект;
- `SUPABASE_SERVICE_ROLE_KEY` используется только server-only;
- Supabase Auth Admin API не вызывается из клиентских компонентов;
- `pg`, Prisma и локальный DB-layer не возвращаются в проект.

## 5. Supabase client lifecycle

### 5.1. Server-side clients

Server Supabase client создается на время запроса и не хранится как глобальное
состояние между пользователями.

Правила:

- не создавать несколько Supabase server clients внутри одного loader без
  причины;
- session/profile resolver вызывается один раз на защищенную страницу и
  передается вниз как проверенный контекст;
- независимые чтения можно запускать через `Promise.all`, если они не зависят
  друг от друга;
- зависимые чтения должны быть явно обоснованы, чтобы не скрывать waterfall.

### 5.2. Browser-side clients

Browser Supabase client используется только для auth/client flows, если это
описано в production-auth spec.

Правила:

- не читать приватные учебные данные из браузера напрямую;
- не переносить server-side фильтрацию на клиент;
- не создавать новый browser client в каждом компоненте;
- не хранить service-role key или любые server-only credentials в client bundle.

### 5.3. Timeouts and failure mode

Supabase-запросы, которые влияют на protected pages, должны иметь понятное
поведение при ошибке:

- setup/config error показывается как setup-state;
- временная ошибка Supabase показывается как error-state без stack trace;
- proxy auth refresh остается best-effort;
- smoke должен отличать ошибку Supabase от пустого рабочего состояния.

## 6. Правила запросов к Supabase

### 6.1. Select only needed columns

Каждый `.select(...)` должен перечислять нужные поля.

Нежелательно:

```ts
.select("*")
```

Допустимо только для локальной диагностики, временных скриптов или очень малых
таблиц, если это явно обосновано.

### 6.2. Mandatory scoping

Все запросы к доменным данным должны быть ограничены организацией или
проверенным пользовательским контекстом.

Типовые обязательные фильтры:

- `organization_id`;
- `teacher_id`;
- `student_id`;
- `group_id`;
- `course_id`;
- `status`;
- период дат для уроков, посещаемости и оплат.

Запрос без `organization_id` допустим только если таблица техническая,
глобальная или доступ проверяется через уже загруженный родительский объект.

### 6.3. No unbounded lists

Страница не должна загружать неограниченный список строк.

Правила:

- списки получают `limit` или рабочий период;
- журнал загружает уроки выбранного месяца, а не всю историю группы;
- посещаемость загружает выбранный месяц или явно заданный период;
- оплаты загружаются по рабочему статусу, группе, курсу, ученику или странице;
- dashboard загружает краткие топ-списки, а не полные таблицы.

### 6.4. No N+1

Запрещены циклы, где для каждой строки выполняется отдельный Supabase-запрос.

Нужно использовать:

- `in(...)` по списку id;
- join/select по связям, если PostgREST-запрос остается читаемым;
- отдельные batch-запросы по сущностям и сборку view-model в памяти;
- SQL view или RPC только после отдельного решения, если обычный data-layer стал
  сложным или медленным.

### 6.5. Count and aggregates

`count: "exact"` используется только там, где пользователю нужен точный счетчик.

Если счетчик нужен только для краткого сигнала, можно использовать:

- уже загруженный список;
- ограниченный count по периоду;
- материализованную или агрегированную структуру в будущем stage.

Сложные агрегаты посещаемости и оплат не должны вычисляться через много
маленьких запросов.

## 7. PostgreSQL indexes

Каждый новый тяжелый запрос должен иметь подходящий индекс или явное объяснение,
почему индекс не нужен.

Индексы добавляются через SQL migration/schema update и проверяются вместе с
запросом, который они ускоряют.

В текущей Supabase-схеме уже есть базовые индексы для части этих направлений.
Performance stage должен сравнить текущую схему с этим списком, не добавлять
дубликаты и фиксировать только недостающие или более точные составные индексы.

Минимальные направления индексации:

- `users(auth_user_id)` как уникальный partial index, если значение не `null`;
- `users(email)` через уникальность email;
- `organization_members(organization_id, user_id, status)`;
- `courses(organization_id, status)`;
- `groups(organization_id, teacher_id, status)`;
- `groups(organization_id, course_id, status)`;
- `group_students(group_id, status, student_id)`;
- `group_students(student_id, status)`;
- `lessons(organization_id, group_id, starts_at)`;
- `lessons(organization_id, teacher_id, starts_at)`;
- `lessons(schedule_rule_id, starts_at)`;
- `journal_entries(lesson_id, student_id)`;
- `journal_entries(student_id)`;
- `homework(organization_id, status, due_at)`;
- `materials(organization_id, status, visibility)`;
- `payments(organization_id, status, due_at)`;
- `payments(student_id, status)`;
- `payments(group_id, status)`.

Если фактический запрос фильтрует по одному полю, а сортирует или ограничивает
периодом по другому, предпочтителен составной индекс под реальный порядок
фильтрации, например `lessons(group_id, starts_at)`, а не набор отдельных
индексов без проверки плана запроса.

Уникальность, которая одновременно защищает данные и ускоряет чтение:

- один урок расписания на один слот:
  `organization_id + schedule_rule_id + starts_at`;
- одна запись журнала на ученика в уроке:
  `lesson_id + student_id`;
- одно активное членство пользователя в организации:
  `organization_id + user_id`, если модель не допускает дубли.

## 8. Route-level performance contracts

### 8.1. Общие protected pages

Каждая protected page должна:

- один раз получить auth/session context;
- один раз проверить роль/рабочую область;
- загрузить только данные текущей страницы;
- не выполнять прямые запросы из вложенных компонентов;
- не скрывать Supabase error как пустой список.

### 8.2. `/teacher/groups/[groupId]/journal`

Журнал - один из главных performance-critical экранов.

Правила:

- загружать только выбранный месяц;
- загружать только уроки реальной группы;
- загружать только активных или релевантных учеников группы;
- загружать `journal_entries` batch-запросом по `lesson_id in (...)`;
- не делать запрос на каждую ячейку журнала;
- view-model должна быть собрана один раз в data-layer;
- mobile-вид не должен монтировать дополнительный тяжелый редактор, если он не
  открыт пользователем.

### 8.3. `/teacher/attendance`

Сводная посещаемость должна быть рассчитана по ограниченному периоду.

Правила:

- период по умолчанию - текущий месяц;
- фильтры группы и низкой посещаемости применяются server-side;
- уроки, ученики и записи журнала загружаются batch-запросами;
- будущие уроки не участвуют в процентах;
- пустая отметка считается присутствием только по правилам attendance spec;
- список не должен загружать всю историю преподавателя.

### 8.4. Admin dashboard and lists

Админские списки должны:

- иметь рабочий limit или пагинацию;
- сортироваться по индексируемым полям;
- показывать краткие сигналы без загрузки полной истории каждого объекта;
- не считать большие финансовые или учебные агрегаты через N+1.

### 8.5. Student cabinet

Кабинет ученика должен:

- загружать только данные текущего ученика;
- не запрашивать чужие группы и оплату;
- показывать ближайшие и последние элементы ограниченным списком;
- не показывать технические нули, если данных для честной сводки недостаточно.

## 9. Performance budgets

Budgets нужны как регрессионные ориентиры. После первого performance baseline
их можно уточнить отдельным plan update.

Измерения выполняются в production-сборке, не в `next dev`.

Начальные целевые ориентиры для dev Supabase seed:

- protected route без тяжелой таблицы: server response до 1500 ms;
- тяжелый журнал выбранного месяца: server response до 2500 ms;
- `/teacher/attendance`: server response до 2000 ms;
- route-level Supabase-запросов на страницу: не больше 10 для обычной страницы;
- журнал и admin dashboard: не больше 14 Supabase-запросов на страницу;
- один Supabase-запрос в норме должен быть быстрее 500 ms на dev-проекте;
- запрос дольше 1000 ms требует диагностики индекса, объема данных или сети.

Эти числа не являются production SLA. Это начальный локальный guardrail для
первого performance stage.

## 10. Measurement protocol

Перед оптимизациями нужно зафиксировать baseline.

Обязательные проверки:

- `npm.cmd run build`;
- production server через `next start` или эквивалентный локальный запуск;
- HTTP timings ключевых маршрутов;
- `npm.cmd run smoke:roles` после изменений;
- `npm.cmd run smoke:auth`, если stage затрагивает auth/session/Supabase
  helpers.

Ключевые маршруты baseline:

- `/login`;
- `/admin`;
- `/admin/groups`;
- `/admin/students`;
- `/teacher`;
- `/teacher/groups`;
- `/teacher/groups/[groupId]/journal`;
- `/teacher/attendance`;
- `/student`;
- `/student/attendance`.

Для каждого маршрута performance audit должен записывать:

- status code;
- redirect target, если есть;
- server response time;
- размер HTML ответа;
- количество Supabase-запросов, если instrumentation включен;
- суммарное время Supabase;
- самый медленный Supabase-запрос;
- есть ли `data-supabase-state="error"` или `data-supabase-state="setup"`.

## 11. Instrumentation

Для performance stage допускается добавить локальную instrumentation, если она:

- выключена по умолчанию;
- включается env-флагом, например `DESHAR_PERF_LOG=1`;
- не пишет secrets;
- не логирует персональные данные учеников сверх технических id и названий
  loader/query;
- работает только server-side;
- не меняет пользовательский интерфейс.

Рекомендуемый формат события:

```text
[perf] route=/teacher/attendance loader=getTeacherAttendance query=lessons duration_ms=123 rows=16
```

Если instrumentation добавляется, она должна иметь smoke или ручную проверку,
что при выключенном флаге логов нет.

## 12. Caching and freshness

Персональные учебные данные нельзя кешировать глобально без ключа пользователя,
организации и роли.

Правила:

- auth/session/profile не кешируются глобально;
- данные ученика не кешируются так, чтобы их мог получить другой пользователь;
- справочники и стабильные labels можно держать как обычные module-level
  constants;
- server cache допустим только после отдельного решения с cache key,
  invalidation и security review;
- после server action пользователь должен видеть свежие данные на связанной
  странице.

## 13. Supabase region and infrastructure

Быстродействие Supabase зависит не только от кода.

Перед production deploy нужно отдельно проверить:

- регион Supabase проекта;
- регион hosting приложения;
- сетевую задержку между hosting и Supabase;
- лимиты Supabase плана;
- размер таблиц и рост `journal_entries`, `lessons`, `payments`;
- backup/monitoring как отдельный infrastructure stage.

Если приложение и Supabase находятся в удаленных регионах, кодовые оптимизации
не смогут полностью компенсировать latency.

## 14. Запрещенные оптимизации

Нельзя:

- убирать проверки прав ради скорости;
- переносить приватные данные в клиент ради меньшего TTFB;
- использовать service-role key в браузере;
- возвращать Prisma/local DB;
- кешировать данные всех организаций одним ключом;
- подменять Supabase error пустым состоянием;
- удалять учебную историю ради уменьшения таблиц;
- добавлять индексы без понимания запроса, который они обслуживают.

## 15. Definition of done для performance stage

Performance stage считается завершенным, если:

- baseline зафиксирован до изменений;
- изменения относятся к конкретным измеренным bottlenecks;
- добавленные индексы или query changes описаны в итоговом документе stage;
- `git diff --check` прошел;
- `npm.cmd run lint` прошел, если менялся код;
- `npm.cmd run build` прошел;
- `npm.cmd run smoke:roles` прошел;
- `npm.cmd run smoke:auth` прошел, если затронут auth/Supabase session flow;
- после изменений есть сравнение baseline vs result;
- оставшиеся hotspots записаны как ограничения или следующий stage.

## 16. Следующий ожидаемый plan

После утверждения этой спецификации следующий отдельный stage может быть:

`Release 1.0 Performance Baseline And Supabase Optimization`

Его цель:

- измерить текущие route timings;
- найти самые дорогие Supabase-запросы;
- закрыть 2-4 самых заметных bottlenecks;
- не менять product-scope и не смешивать работу с release candidate notes.
