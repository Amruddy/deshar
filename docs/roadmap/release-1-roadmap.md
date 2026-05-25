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
- Завершенные design stages считаются текущей Release 1.0 визуальной основой;
  новые UI-изменения должны идти отдельным plan и не смешиваться с auth,
  hardening или performance-правками.
- Каждый stage должен иметь work plan, проверки, commit, push и историю в completed plans.
- `NN-...-plan.md` - сквозной номер документа work-plan в `active`/`completed`;
  `Release Stage N` - номер этапа внутри `Release 1.0`. Эти номера не обязаны
  совпадать.

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

завершен, PR #53.

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

### Release Stage 4. New Visual Design

Статус:

завершен, PR #54.

Цель:

сделать новый цельный визуальный дизайн приложения после production auth и
предыдущего polish-stage.

Входит:

- новый визуальный язык для `/login`, app-shell и рабочих областей;
- пересмотр фона, навигации, панелей, таблиц, форм, кнопок, статусов и loading states;
- единый вид для администратора, преподавателя и ученика;
- mobile/desktop проверка ключевых экранов;
- сохранение текущей бизнес-логики, маршрутов, ролей и data-layer.

### Release Stage 5. Functional UX Fixes Before Hardening

Статус:

завершен, PR #56.

Цель:

закрыть функциональные UX-блокеры, найденные после внедрения нового визуального дизайна, до production hardening.

Входит:

- корректная работа журнала и уроков выбранного месяца после генерации расписания на один или несколько месяцев;
- отображение ближайших занятий на обзоре преподавателя;
- отмена или архивирование ошибочно заданного домашнего задания;
- безопасное архивирование группы или понятное ограничение, если физическое удаление невозможно из-за истории;
- корректная посещаемость ученика без технически странных нулей при отсутствии данных;
- точечная проверка таблиц и списков на наложение текста после функциональных правок.

Не входит:

- новый redesign;
- изменение auth-flow;
- онлайн-оплата;
- загрузка файлов;
- крупная переработка схемы данных без необходимости.

### Release Stage 6. Production Hardening

Статус:

завершен, PR #57.

Цель:

подготовить продукт к стабильному использованию.

Входит:

- проверка env/config;
- hardening ошибок и пустых состояний;
- проверка закрытых маршрутов;
- проверка service-role/server-only ограничений;
- обновление release limitations.

Результат:

- env/config hardening и server-only границы зафиксированы;
- `smoke:roles` и `smoke:auth` актуализированы;
- результат stage описан в `docs/release/release-1-production-hardening.md`.

### Release Stage 7. Release Candidate Smoke And Notes

Статус:

завершен, PR #59.

Цель:

собрать release candidate и финальную историю готовности.

Входит:

- полный smoke admin/teacher/student;
- auth smoke;
- основные бизнес-сценарии: группы, журнал, прогресс, задания, оплаты;
- первый release-candidate blocker: рабочий журнал и сводная посещаемость
  преподавателя;
- список известных ограничений;
- финальные release notes.

Результат:

- role/auth smoke Release 1.0 зафиксирован в release notes;
- рабочий журнал и сводная посещаемость преподавателя закрыты ранее в PR #58;
- release candidate notes сохранены в `docs/release/release-1-release-candidate.md`.

### Release Stage 8. Performance Baseline And Supabase Optimization

Статус:

завершен, PR #61.

План:

`docs/work-plans/completed/36-performance-baseline-supabase-plan.md`

Цель:

зафиксировать baseline быстродействия сайта, выявить тяжелые Supabase-запросы и
подготовить точечные оптимизации без изменения бизнес-логики Release 1.0.

Входит:

- измерение ключевых маршрутов и server actions;
- аудит Supabase-запросов, N+1, лишних round-trip и тяжелых списков;
- индексы, pagination, projection и кеширование только после зафиксированного
  baseline;
- сохранение server-side authorization и текущих границ production auth.

Не входит:

- новая продуктовая функциональность;
- смена auth-flow;
- browser-side прямое чтение Supabase без отдельного RLS/security stage;
- массовая переработка схемы данных без отдельного плана.

### Release Stage 9. Public Registration And Solo Teacher

Статус:

завершен, PR #62.

План:

`docs/work-plans/completed/37-public-registration-solo-teacher-plan.md`

Цель:

добавить production-регистрацию с главной страницы для двух владельческих сценариев:
новая школа с администратором-владельцем и преподаватель-одиночка со своей организацией.

Входит:

- форма входа, восстановления и регистрации на `/` / `/login`;
- регистрация новой школы;
- регистрация преподавателя-одиночки как роли `solo_teacher`;
- email confirmation через Supabase Auth;
- сохранение invite-only flow для учеников и обычных преподавателей школы;
- dev-auth только для локального smoke/dev режима.

Не входит:

- публичная регистрация учеников;
- публичная регистрация обычного преподавателя в существующую школу без приглашения;
- OAuth/social login, SSO, MFA/passkeys;
- billing/online payment;
- production deploy, домен и SMTP-настройка вне описания ручных Supabase шагов.

### Release Stage 10. Post-registration Performance

Статус:

завершен, PR #63.

План:

`docs/work-plans/completed/38-post-registration-performance-plan.md`

Цель:

ускорить переходы после регистрации и входа без изменения ролей, регистрации,
invite-only правил и security boundaries.

Входит:

- baseline в production-сборке после публичной регистрации;
- request-level memoization для session/profile resolver;
- сокращение лишних Supabase round-trip в session resolver;
- запрет лишней записи `users.last_sign_in_at` на каждом protected request;
- повторный `perf:baseline`, `smoke:auth` и `smoke:roles`.

Не входит:

- изменение product-scope регистрации;
- browser-side доступ к приватным Supabase tables;
- новая визуальная переработка;
- production deploy, домен, SMTP или смена Supabase region.

### Release Stage 11. Stitch UI/UX Transfer

Статус:

завершен, PR #66.

План:

`docs/work-plans/completed/39-stitch-ui-ux-transfer-plan.md`

Цель:

перенести визуальное направление Google Stitch в реальные страницы приложения
без изменения product-scope, ролей, auth-flow и модели данных.

Входит:

- перенос визуального направления Stitch в app shell и рабочие экраны;
- обновление рабочих страниц преподавателя и ученика;
- обновление таблиц, сигналов, состояний и плотности интерфейса;
- сохранение текущей бизнес-логики и маршрутов;
- проверка, что локальные Stitch-референсы не коммитятся в репозиторий.

Не входит:

- новый product-scope;
- изменение production auth;
- изменение схемы данных;
- performance-оптимизации после переноса интерфейса.

### Release Stage 12. Post-Stitch Runtime Performance

Статус:

завершен, PR #67.

План:

`docs/work-plans/completed/40-post-stitch-runtime-performance-plan.md`

Цель:

измерить baseline после завершенного Stitch UI/UX Transfer и ускорить самые
заметные runtime/Supabase bottlenecks без нового redesign и без изменения
product-scope.

Результат:

- baseline и итоговые замеры зафиксированы в
  `docs/release/release-1-post-stitch-performance.md`;
- ускорены ключевые маршруты преподавателя и ученика, включая журнал группы,
  обзор преподавателя, список групп, посещаемость и ученические страницы;
- оставшиеся hotspots описаны в release report для будущих performance stages.

## 5. Текущий активный stage

Текущий кодовый stage не выбран.

Последний завершенный stage:

`Release Stage 12. Post-Stitch Runtime Performance`, PR #67.

План:

`docs/work-plans/completed/40-post-stitch-runtime-performance-plan.md`

Перед следующим кодовым stage нужно выбрать или создать новый active work-plan.
