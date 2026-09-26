# Word Dragon RC6 B28-F — Verification Record

## Verified CI run

- Branch: `b28f-gate-recovery`
- Verified commit: `0129969816531ff77bda0770346033e968284346`
- GitHub Actions run: `36224396444`
- Job: `selfchecks`
- Environment: Ubuntu 24.04, Node v22.23.2
- Command: `node tests/run-b28f-selfchecks.js`
- Result: **PASS — 14/14 selfchecks**
- Run completed: 2026-09-26

## Passing checks

1. Gate recovery core
2. Gate Recovery controller
3. Gate retest sampler/history
4. Gate Recovery E2E
5. Gate Recovery edge cases
6. Gate Recovery persistence
7. Gate Recovery card
8. Gate Repair launcher
9. Gate Repair coordinator
10. Gate Repair activity adapters
11. Stage Gate runtime adapter
12. Gate action single-flight guard
13. Profile migration
14. Bootstrap integration

## Scope / limitations

This CI result verifies the committed B28-F JavaScript contracts and integration selfchecks. It does not by itself prove real-device Android Chrome microphone support or full B28-E application integration, because the full B28-E source tree has not yet been imported into this GitHub branch.

The formal stable release remains B28-E until B28-F is integrated into the full application and its browser/deployment checks are rerun.
