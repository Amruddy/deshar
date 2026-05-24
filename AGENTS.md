# Development Workflow

This project is developed with Codex assistance.

Codex must use the project specifications as the source of truth before making code changes.

## Project Language

- The project language is Russian.
- Write project documentation and specification updates in Russian by default.
- Use Russian for user-facing interface copy unless a spec explicitly requires another language.
- Keep technical identifiers, file names, routes, commands, code, and third-party API names in their conventional language.

## Source of Truth

- Read `docs/roadmap/README.md` before implementation.
- Read relevant files in `docs/specs/` before implementation.
- Read the active work plan in `docs/work-plans/active/` if one exists.
- If a feature is not described in the specs, do not implement it.
- If a spec is unclear, clarify or update the spec before coding.
- Follow `docs/roadmap/README.md` and the active work plan named by
  `docs/work-plans/active/README.md` when an active plan is selected.

## Working Order

1. Spec
2. Plan
3. Code
4. Automated verify
5. Codex smoke verify
6. Optional user review gate
7. Commit

## Development Rules

- Keep changes small and tied to one verifiable stage.
- Do not mix unrelated stages or roadmap blocks in one commit.
- Prefer existing project patterns once the application code exists.
- Run available checks after changes.
- After automated checks, Codex should run a basic smoke-check itself whenever the project can be checked locally.
- When the user asks Codex to inspect, fix, implement, or verify work in this repository, treat that request as permission for Codex to read, list, search, and open project files, and to run non-destructive local verification commands needed for the task without asking for approval each time.
- The user grants Codex standing permission to read, list, search, and open all local files, including files outside this repository such as Codex skills, plugins, caches, and local configuration. Codex should not ask conversational permission for read-only file access.
- Non-destructive local verification includes commands such as `git status`, `git diff`, `npm.cmd run lint`, `npm.cmd run build`, project smoke scripts, and starting a local dev server for smoke-checks when the task requires it.
- Codex should ask the user again only for destructive actions, secrets or credentials, external services or network operations that require approval, database writes outside the local development flow, branch-changing operations not already covered by the stage workflow, and commit/push actions required by this file.
- If the Codex runtime or sandbox requires a separate approval prompt for a command, Codex may request that technical approval, but should not add extra conversational permission questions for already authorized read/check actions.
- Before committing and pushing a stage, summarize in Russian what Codex already checked, then explicitly ask whether the user wants to do a manual check before commit/push.
- The manual check prompt must include concrete paths or URLs to open, the exact user actions to try, and what result should be expected for the current stage.
- The user may skip manual review and explicitly tell Codex to continue. If the user asks to review manually, do not commit, push, or move to the next MPMF 1.0 stage until the user explicitly confirms to continue.
- When the user gives permission to finish the stage after checks, Codex should commit and push the stage branch. Codex does not open the pull request unless the user explicitly asks.
- Do not revert user changes unless explicitly requested.

## Completion Notification

- После завершения работы Codex должен явно уведомить пользователя, что работа
  завершена, и кратко перечислить итог: ветку, коммиты, проверки и следующий
  ожидаемый шаг.

## Branch Workflow For Project Stages

- Новый stage нельзя реализовывать напрямую в `main`.
- Когда пользователь явно говорит начать код для stage, нужно создать отдельную ветку от актуального `main`.
- В ветку stage коммитится только завершенная и проверенная работа этого stage.
- После автоматической проверки Codex сам выполняет базовую smoke-проверку stage, если это возможно локально.
- После своей smoke-проверки Codex кратко пишет пользователю, что уже проверено, явно спрашивает, хочет ли пользователь ручную проверку перед commit/push, и дает конкретный ручной smoke-маршрут с URL/путями, действиями и ожидаемым результатом.
- Ветка stage коммитится и пушится после явной команды пользователя продолжать; ручная проверка пользователя не обязательна, если пользователь ее пропускает.
- Сообщение пользователя `готово` после отчета Codex о проверках считается явной командой продолжать: Codex сам коммитит и пушит текущую stage-ветку.
- Pull request открывает пользователь. После merge пользователь сообщает Codex, Codex возвращается на `main`, обновляет его из GitHub и только потом начинает следующую stage-ветку.
- После подтверждения пользователя ветка stage пушится в GitHub и готовится к pull request.
- Следующий stage нельзя начинать, пока предыдущий stage не смержен.
- Перед началом следующего stage нужно вернуться в `main` и обновить его из GitHub, чтобы новая ветка начиналась от последнего смерженного состояния.
- Цикл для каждого stage: обновить `main`, создать ветку stage, реализовать, проверить, закоммитить, запушить, открыть pull request, смержить, снова обновить `main`.
- Если пользователь сообщает, что PR/stage смержен, Codex должен сам выполнить переход на `main` и обновление из GitHub перед обсуждением или началом следующего этапа. Пользователь не обязан отдельно писать команду "перейди на main".

## Current Release 1.0 Direction

The current roadmap is:

`docs/roadmap/README.md`

The current active implementation source of truth is named in:

`docs/work-plans/active/README.md`

Current active technical plan:

`docs/work-plans/active/37-public-registration-solo-teacher-plan.md`

Use the roadmap and `docs/work-plans/active/README.md` to determine whether a
stage is active. If no active plan is selected, create or update the next stage
plan before coding.
