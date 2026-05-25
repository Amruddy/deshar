# Project Roadmap

# Дорожная карта Deshar

## 0. Назначение

Документ фиксирует текущий этап разработки и связывает стабильные спецификации с рабочими планами.

Источники правды:

- спецификации продукта: `docs/specs/`;
- roadmap текущей релизной версии: `docs/roadmap/release-1-roadmap.md`;
- roadmap production-auth подплана: `docs/roadmap/production-auth-and-real-accounts-roadmap.md`;
- активный рабочий план: `docs/work-plans/active/`;
- завершенные планы: `docs/work-plans/completed/`;
- исторический roadmap MPMF 1.0: `docs/roadmap/mpmf-1-implementation-roadmap.md`.

Правило нумерации:

- `NN-...-plan.md` - сквозной номер документа work-plan в папках
  `docs/work-plans/active/` и `docs/work-plans/completed/`;
- `Release Stage N` - номер этапа внутри `Release 1.0`;
- эти номера не обязаны совпадать: например,
  `40-post-stitch-runtime-performance-plan.md` описывает
  `Release Stage 12. Post-Stitch Runtime Performance`.

## 1. Текущий статус

- Текущий большой блок: `Release 1.0`.
- Последний завершенный кодовый stage: `Release Stage 12. Post-Stitch Runtime Performance`, PR #67.
- Активный stage: не выбран.
- Активный план: не выбран.
- Следующий stage: нужно выбрать отдельным work-plan на основе результатов post-Stitch performance baseline.
- Предыдущий блок: `MPMF 1.0`, завершен и смержен в `main`.
- Запись завершения MPMF 1.0: `docs/release/mpmf-1-release-readiness.md`.
- Запись завершения Production Hardening: `docs/release/release-1-production-hardening.md`.
- Запись release candidate: `docs/release/release-1-release-candidate.md`.

## 2. Правило перехода между этапами

Новый stage нельзя реализовывать напрямую в `main`.

Цикл работы:

1. обновить `main`;
2. создать stage-ветку;
3. обновить spec/plan при необходимости;
4. выполнить работу;
5. выполнить автоматические проверки;
6. выполнить базовую smoke-проверку, если применимо локально;
7. показать результат пользователю и короткий ручной чеклист;
8. после явного разрешения пользователя закоммитить и запушить ветку;
9. пользователь открывает и мержит pull request;
10. после merge Codex возвращается на `main` и обновляет его.

## 3. Завершенные этапы MPMF 1.0

- Stage 1: Admin Group Detail, PR #30.
- Stage 2: Group Schedule And Lessons, PR #31.
- Stage 3: Teacher Groups, PR #32.
- Stage 4: Calendar Journal, PR #33.
- Stage 5: Lesson Page, PR #34.
- Entry Page, PR #35.
- Stage 6: Tajweed Progress, PR #36.
- Stage 7: Homework And Materials, PR #37.
- Stage 8: Student Dashboard And Schedule, PR #38.
- Stage 9: Student Learning Cabinet, PR #39.
- Stage 10: Payments, PR #40.
- Stage 11: Admin Entity Completeness, PR #41.
- Stage 12: Access, Empty States And Errors.
- Stage 13: Mass Payment Creation, PR #43.
- Stage 14: Cross-role Smoke Flow, PR #44.
- Stage 15: Mobile And UX Polish, PR #45.
- Stage 16: MPMF 1.0 Release Hardening, PR #46.

## 4. Текущий релизный блок

### Release 1.0

Roadmap:

`docs/roadmap/release-1-roadmap.md`

Фокус:

- настоящая авторизация через Supabase Auth;
- реальные email-приглашения преподавателей и учеников;
- связь auth-пользователя с `users`, ролями, организацией и карточкой ученика;
- финальный UI/UX redesign после production auth;
- production hardening и release candidate smoke;
- performance baseline и оптимизация Supabase-запросов перед runtime-оптимизациями.

Важное решение:

финальный дизайн уже вошел в `Release 1.0` отдельными design stages после
production auth. Будущие изменения UI должны проходить через отдельные
design/performance stages и не смешиваться с правками модели данных.

## 5. Активный подплан

Активный подплан не выбран.

Последний завершенный подплан:

`Release Stage 12. Post-Stitch Runtime Performance`

План:

`docs/work-plans/completed/40-post-stitch-runtime-performance-plan.md`

Результат:

baseline после Stitch UI/UX Transfer измерен, самые заметные runtime/Supabase
bottlenecks ускорены без нового redesign и без изменения product-scope. Следующий
stage должен быть выбран отдельным active work-plan.

## 6. Stages Release 1.0

1. `Release Stage 1. Release Roadmap Setup` - завершен.
2. `Release Stage 2. Production Auth And Real Accounts` - завершен, PR #52.
3. `Release Stage 3. Final Design System And UX Polish` - завершен, PR #53.
4. `Release Stage 4. New Visual Design` - завершен, PR #54.
5. `Release Stage 5. Functional UX Fixes Before Hardening` - завершен, PR #56.
6. `Release Stage 6. Production Hardening` - завершен, PR #57.
7. `Release Stage 7. Release Candidate Smoke And Notes` - завершен, PR #59.
8. `Release Stage 8. Performance Baseline And Supabase Optimization` - завершен, PR #61.
9. `Release Stage 9. Public Registration And Solo Teacher` - завершен, PR #62.
10. `Release Stage 10. Post-registration Performance` - завершен, PR #63.
11. `Release Stage 11. Stitch UI/UX Transfer` - завершен, PR #66.
12. `Release Stage 12. Post-Stitch Runtime Performance` - завершен, PR #67, план
    `docs/work-plans/completed/40-post-stitch-runtime-performance-plan.md`.
