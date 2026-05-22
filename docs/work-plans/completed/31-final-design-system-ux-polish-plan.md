# План Final Design System And UX Polish

## 0. Статус

- Статус плана: завершен, PR #53.
- Большой блок: `Release 1.0`.
- Stage релиза: `Release Stage 3. Final Design System And UX Polish`.
- Планируемая ветка: `feat/final-design-system-ux-polish`.
- Roadmap релиза: `docs/roadmap/release-1-roadmap.md`.
- Предыдущий завершенный plan: `docs/work-plans/completed/30-auth-stage-5-auth-smoke-hardening-plan.md`.

## 1. Цель

Привести существующий интерфейс после production auth к более зрелой, спокойной
и цельной рабочей дизайн-системе без добавления новых функций.

Stage должен улучшить визуальную плотность, читаемость таблиц и списков, формы,
кнопки, статусы, навигацию, входной экран, профиль и mobile/desktop поведение
ключевых рабочих областей.

## 2. Источники правды

Перед кодом нужно читать:

- `docs/roadmap/README.md`;
- `docs/roadmap/release-1-roadmap.md`;
- `docs/specs/04-visual-rules.md`;
- `docs/specs/03-technical-specs/pages-and-routes.md`;
- `docs/specs/03-technical-specs/permissions.md`;
- `docs/release/release-1-auth-readiness.md`;
- текущие компоненты `app/components/`;
- текущие страницы `app/admin`, `app/teacher`, `app/student`, `app/login`, `app/profile`.

## 3. Что входит

- Пересмотреть общий визуальный язык приложения:
  - фон;
  - панели;
  - кнопки;
  - ссылки;
  - статусы;
  - таблицы;
  - формы;
  - empty/error states.
- Уменьшить ощущение громоздкости за счет более аккуратных размеров шрифтов,
  высоты строк, отступов и плотности панелей.
- Сделать списки учеников, групп, преподавателей и оплат более читаемыми.
- Привести входной экран, `/profile`, рабочие области и основные app-shell
  элементы к единому визуальному языку System A.
- Улучшить мобильную навигацию и горизонтально прокручиваемые таблицы без
  изменения бизнес-логики.
- Сохранить русскую пользовательскую копию.

## 4. Что не входит

- Новые продуктовые функции.
- Изменение auth-flow, ролей, прав или data-layer.
- Production deploy.
- Онлайн-оплата.
- Загрузка файлов, аудио, видео, чат или уведомления.
- Новый публичный маркетинговый лендинг.
- Крупная перестройка бизнес-страниц, если она меняет доступные действия.

## 5. Проверки

После реализации выполнить:

- `npm.cmd run lint`;
- `npm.cmd run build`;
- `npm.cmd run smoke:roles`;
- `npm.cmd run smoke:auth`;
- smoke `/login`;
- smoke `/profile`;
- smoke `/admin`;
- smoke `/admin/students`;
- smoke `/admin/teachers`;
- smoke `/admin/payments`;
- smoke `/teacher`;
- smoke `/teacher/groups`;
- smoke `/teacher/students`;
- smoke `/student`;
- smoke `/student/homework`;
- smoke mobile viewport для `/login`, `/admin/students`, `/teacher/groups`,
  `/student`.

## 6. Ручная проверка перед commit/push

После автоматических проверок Codex должен дать пользователю конкретный маршрут:

- открыть `/login` на desktop и mobile ширине;
- войти администратором и проверить `/admin`, `/admin/students`,
  `/admin/teachers`, `/admin/payments`;
- войти преподавателем и проверить `/teacher`, `/teacher/groups`,
  `/teacher/students`;
- войти учеником и проверить `/student`, `/student/homework`, `/student/payments`;
- открыть `/profile`;
- проверить, что действия остались теми же, текст не обрезается, таблицы читаемы,
  статусы понятны, мобильная навигация не перекрывает контент.

## 7. Следующий stage

После merge этого stage:

`Production Hardening`
