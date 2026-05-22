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

## 1. Текущий статус

- Текущий большой блок: `Release 1.0`.
- Последний завершенный кодовый stage: `Auth Stage 5. Auth Smoke And Hardening`.
- Активный stage: `Final Design System And UX Polish`.
- Активный план: `docs/work-plans/active/31-final-design-system-ux-polish-plan.md`.
- Планируемая ветка текущего кодового stage: `feat/final-design-system-ux-polish`.
- Предыдущий блок: `MPMF 1.0`, завершен и смержен в `main`.
- Запись завершения MPMF 1.0: `docs/release/mpmf-1-release-readiness.md`.

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
- production hardening и release candidate smoke.

Важное решение:

финальный дизайн входит в `Release 1.0` как отдельный обязательный stage после production auth. Текущий UI не считается финальным.

## 5. Активный подплан

### Final Design System And UX Polish

Roadmap:

`docs/roadmap/release-1-roadmap.md`

Активный stage:

`Final Design System And UX Polish`

Активный work plan:

`docs/work-plans/active/31-final-design-system-ux-polish-plan.md`

После него:

`Production Hardening`

## 6. Следующие крупные stages Release 1.0

1. `Auth Stage 2. Supabase Auth Session Foundation`.
2. `Auth Stage 3. Account Linking And Schema`.
3. `Auth Stage 4. Admin Invitations`.
4. `Auth Stage 5. Auth Smoke And Hardening`.
5. `Final Design System And UX Polish`.
6. `Production Hardening`.
7. `Release Candidate Smoke And Notes`.
