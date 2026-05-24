# План Release 1.0 Post-registration Performance

## 0. Статус

- Статус плана: активная реализация.
- Большой блок: `Release 1.0`.
- Stage релиза: `Release Stage 10. Post-registration Performance`.
- Рабочая ветка: `feat/post-registration-performance`.
- Предыдущий завершенный plan: `../completed/37-public-registration-solo-teacher-plan.md`.
- Roadmap релиза: `docs/roadmap/release-1-roadmap.md`.
- Технические спецификации: `docs/specs/03-technical-specs/performance-and-supabase.md`, `docs/specs/03-technical-specs/production-auth.md`.

## 1. Цель

Ускорить переходы после регистрации и входа без изменения product-scope, ролей и границ безопасности.

Пользовательский симптом: после добавления публичной регистрации рабочие страницы открываются медленно. Первичный baseline показывает, что `/login` быстрый, а задержка возникает на protected routes после auth/session resolution.

## 2. Границы

Входит:

- измерить baseline в production-сборке;
- убрать повторный session/profile resolver в одном server-render request;
- сократить лишние Supabase round-trip в session resolver;
- убрать запись в `users` на каждом открытии protected page, если auth-профиль уже активен и связан;
- проверить `/login`, `/admin`, `/teacher`, `/student` и smoke auth/roles.

Не входит:

- изменение ролей, регистрации, invite-only правил или business logic;
- перенос данных в browser-side Supabase;
- изменение Supabase region/hosting;
- новая визуальная переработка;
- онлайн-оплата, billing, OAuth, SSO, MFA.

## 3. Baseline до изменений

Production-сервер: `http://127.0.0.1:3007`.

Команда:

`PERF_BASE_URL=http://127.0.0.1:3007 PERF_AUTH_MODE=supabase PERF_SAMPLES=5 PERF_WARMUPS=1 npm.cmd run perf:baseline`

Результат до изменений:

| Route | Median ms | HTML bytes | State |
|---|---:|---:|---|
| `/login` | 10 | 22525 | ready |
| `/admin` | 1654 | 24427 | ready |
| `/admin/groups` | 2139 | 30244 | ready |
| `/admin/students` | 1967 | 29275 | ready |
| `/teacher` | 2005 | 21545 | ready |
| `/teacher/groups` | 1688 | 24389 | ready |
| `/teacher/groups/[groupId]/journal` | 2127 | 75652 | ready |
| `/teacher/attendance` | 1943 | 48923 | ready |
| `/student` | 2710 | 21137 | ready |
| `/student/attendance` | 2691 | 18943 | ready |

## 4. Диагноз

- `/login` быстрый, значит новая регистрационная форма не является главным bottleneck.
- Protected layouts вызывают `AppShell`, а страницы дополнительно вызывают `requireWorkspace`. Без request-level memoization это повторяет session/profile resolution.
- Session resolver обновляет `users.auth_status`, `auth_user_id` и `last_sign_in_at` при каждом protected request, даже если пользователь уже active. Это лишний write round-trip.
- Membership и organization читаются отдельными запросами, хотя для session достаточно одного join/read.

## 5. Рабочий порядок

1. Обновить roadmap/active plan под новый performance stage.
2. Добавить request-level memoization для `getAppSessionResult`.
3. Изменить auth profile update так, чтобы он выполнялся только при первом связывании или переходе auth status в `active`.
4. Считать organization вместе с membership.
5. Переснять baseline тем же скриптом.
6. Выполнить `git diff --check`, `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run smoke:auth`, `npm.cmd run smoke:roles`.

## 6. Результат после изменений

Команда:

`PERF_BASE_URL=http://127.0.0.1:3007 PERF_AUTH_MODE=supabase PERF_SAMPLES=5 PERF_WARMUPS=1 npm.cmd run perf:baseline`

Результат после изменений:

| Route | Before median ms | After median ms | Delta ms | HTML bytes | State |
|---|---:|---:|---:|---:|---|
| `/login` | 10 | 10 | 0 | 22525 | ready |
| `/admin` | 1654 | 827 | -827 | 24427 | ready |
| `/admin/groups` | 2139 | 1339 | -800 | 30244 | ready |
| `/admin/students` | 1967 | 1112 | -855 | 29275 | ready |
| `/teacher` | 2005 | 1498 | -507 | 23243 | ready |
| `/teacher/groups` | 1688 | 1325 | -363 | 24389 | ready |
| `/teacher/groups/[groupId]/journal` | 2127 | 1793 | -334 | 75652 | ready |
| `/teacher/attendance` | 1943 | 1613 | -330 | 48923 | ready |
| `/student` | 2710 | 2234 | -476 | 21137 | ready |
| `/student/attendance` | 2691 | 2589 | -102 | 18943 | ready |

Итог:

- protected routes ускорились на 102-855 ms по median без изменения ролей и product-scope;
- `/admin/students` дополнительно переведен с общей загрузки базовых данных организации на узкий loader списка учеников;
- `/teacher` дополнительно переведен с общей загрузки базовых данных организации на loader групп и учеников конкретного преподавателя;
- все routes вернули `200` и `data-supabase-state="ready"`;
- в samples остались редкие max-выбросы около 46 секунд на `/teacher/groups/[groupId]/journal` и `/teacher/attendance`; это следующий отдельный hotspot для диагностики тяжелых teacher loaders или сетевой задержки Supabase, но median стал быстрее.

## 7. Проверки

Выполнено:

- `git diff --check` - прошел;
- `npm.cmd run lint` - прошел;
- `npm.cmd run build` - прошел после остановки локальных серверов;
- `npm.cmd run perf:baseline` на `http://127.0.0.1:3007` в production-сборке - прошел, все routes `ready`;
- `npm.cmd run smoke:auth` на `http://127.0.0.1:3007` - прошел с `DESHAR_ENABLE_DEV_AUTH=0`, потому что `next start` скрывает dev-auth при `NODE_ENV=production`;
- `npm.cmd run smoke:roles` на `http://127.0.0.1:3008` - прошел в `next dev` с `DESHAR_ENABLE_DEV_AUTH=1` и `SUPABASE_FETCH_TIMEOUT_MS=45000`.

Примечания:

- `smoke:roles` использует dev-cookie роли и не является production Supabase auth smoke;
- первые два прогона `smoke:roles` при `SUPABASE_FETCH_TIMEOUT_MS=15000` ловили разные временные Supabase error-state на `/admin/students` и `/teacher/homework`; после увеличения таймаута проверка ролей прошла полностью.

## 8. Definition of Done

Stage завершен, если:

- protected route timings после изменений зафиксированы и сравнены с baseline;
- auth/session права не ослаблены;
- публичная регистрация и `solo_teacher` flow остаются рабочими;
- automated checks и smoke проходят;
- пользователь получил ручной smoke-маршрут перед commit/push.
