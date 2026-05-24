# Active Plans

Эта папка хранит текущий активный рабочий план.

Текущий активный технический план:

`38-post-registration-performance-plan.md`

Последний завершенный stage:

`../completed/37-public-registration-solo-teacher-plan.md`

Следующий ожидаемый stage:

`Release 1.0 Post-registration Performance`

Первый блок активного stage:

ускорение protected routes после регистрации и входа: session resolver, лишние Supabase round-trip и повторные auth/profile checks.

Codex перед разработкой должен читать:

- текущий active README;
- активный план, если он выбран;
- `docs/roadmap/README.md`;
- связанные спецификации из `docs/specs/`.

Post-registration performance выполняется только по активному plan и после baseline
в production-сборке, потому что performance spec запрещает оптимизации без измерения.
