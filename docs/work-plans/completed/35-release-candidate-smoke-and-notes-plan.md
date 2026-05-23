# План Release Candidate Smoke And Notes

## 0. Статус

- Статус плана: завершен, PR #59.
- Большой блок: `Release 1.0`.
- Stage релиза: `Release Stage 7. Release Candidate Smoke And Notes`.
- Рабочая ветка: `feat/release-candidate-smoke-notes`.
- Коммит stage: `27b765e` (`Document release candidate smoke notes`).
- Merge-коммит: `3887c7e` (`Merge pull request #59 from Amruddy/feat/release-candidate-smoke-notes`).
- Предыдущий завершенный plan: `../completed/34-production-hardening-plan.md`.
- Roadmap релиза: `docs/roadmap/release-1-roadmap.md`.
- Первый blocker по журналу и посещаемости закрыт в PR #58
  (`fix/teacher-attendance-journal`).
- Release-документ: `docs/release/release-1-release-candidate.md`.

## 1. Цель

Собрать release candidate и финальную историю готовности Release 1.0.

Первый release-candidate blocker: привести журнал и посещаемость преподавателя к
рабочему состоянию перед финальным smoke:

- журнал группы должен открываться преподавателем и оставаться рабочим для
  быстрых отметок;
- раздел `/teacher/attendance` должен показывать сводную посещаемость
  преподавателя, а не заглушку;
- smoke должен отличать рабочую посещаемость от пустой заглушки.

## 2. Источники правды

Перед кодом нужно читать:

- `docs/roadmap/README.md`;
- `docs/roadmap/release-1-roadmap.md`;
- `docs/specs/02-feature-specs/calendar-journal.md`;
- `docs/specs/02-feature-specs/attendance.md`;
- `docs/specs/03-technical-specs/pages-and-routes.md`;
- `docs/specs/03-technical-specs/permissions.md`;
- `docs/specs/03-technical-specs/states-and-validation.md`;
- `docs/specs/04-interface-by-role.md`;
- `docs/specs/04-visual-rules.md`;
- `docs/release/release-1-production-hardening.md`.

## 3. Что входит

### 3.1. Журнал и посещаемость

- Проверить открытие журнала группы преподавателем.
- Проверить открытие страницы урока из журнала, если в выбранном месяце есть
  уроки.
- Реализовать `/teacher/attendance` как сводку по ученикам преподавателя:
  процент посещаемости, количество уроков, присутствия, пропуски, уважительные
  причины, последний урок и статус.
- Поддержать базовые фильтры: месяц, группа, только с пропусками, только с
  низкой посещаемостью.
- Сохранить текущие правила прав доступа: преподаватель видит только свои
  группы и учеников.

### 3.2. Smoke и release notes

- Усилить `smoke:roles`, чтобы `/teacher/attendance` проверялся как рабочий
  раздел, а не только как маршрут без ошибки.
- После исправления пройти автоматические проверки.
- Зафиксировать оставшиеся release limitations и финальные release notes.

### 3.3. Статус release-candidate smoke

На 2026-05-23 проверено:

- `git diff --check` - прошел;
- `npm.cmd run lint` - прошел;
- `npm.cmd run build` - прошел;
- `npm.cmd run smoke:roles` - прошел, проверено 37 маршрутов и прав доступа,
  пропущено 0 динамических ссылок;
- `npm.cmd run smoke:auth` - прошел для admin/teacher/student и disabled
  profile;
- HTTP-smoke преподавателя подтвердил `/teacher/groups`,
  `/teacher/groups/[groupId]/journal` и `/teacher/attendance`.

Результат release-candidate проверки зафиксирован в:

`docs/release/release-1-release-candidate.md`

## 4. Что не входит

- Новый redesign.
- Новые роли и новые права.
- Онлайн-оплата.
- Загрузка файлов.
- Родительские аккаунты.
- Сложная аналитика посещаемости и графики.
- Production deploy, домен, backup-политика и мониторинг.

## 5. Проверки

После реализации выполнить:

- `git diff --check`;
- `npm.cmd run lint`;
- `npm.cmd run build`;
- `npm.cmd run smoke:roles`;
- smoke `/teacher/groups`;
- smoke `/teacher/groups/[groupId]/journal`;
- smoke `/teacher/attendance`;
- smoke сохранения быстрой отметки журнала, если локальные данные позволяют.

## 6. Ручная проверка перед commit/push

После автоматических проверок Codex должен дать пользователю маршрут:

- открыть `/login` и войти преподавателем;
- открыть `/teacher/groups`;
- открыть группу преподавателя;
- открыть журнал группы;
- выбрать месяц с созданными уроками;
- поставить в ячейках журнала `Н`, `У`, `П` или оценку и сохранить;
- открыть `/teacher/attendance`;
- проверить, что ученик, группа, процент, уроки, пропуски и последний урок
  обновились понятно;
- включить фильтр только с пропусками и проверить, что строки без пропусков
  скрываются.

## 7. Следующий шаг

После merge этого stage:

`Release 1.0 Performance Baseline And Supabase Optimization`
