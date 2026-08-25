# Animation plans

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| 001 | Transition StepRow dot and badge on source status change | MEDIUM | DONE |

## Execution order

1. `001-steprow-status-transition.md` — no dependencies.

## How to run

Implement with any agent using the plan as the only spec:

`improve-animations execute 001-steprow-status-transition`

Do not start other dashboard motion (skeleton crossfade, chat empty→thread, send-button press) until 001 is done and feel-checked; those are separate plans if requested.
