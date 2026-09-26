# B28-F Stage Gate Recovery

Status: development branch checkpoint

## Recovery loop

1. A failed Stage Gate creates a recovery plan for only the weak tested skills.
2. Each weak skill requires 2 successful repair events by default.
3. Retest stays locked until every weak skill reaches its repair requirement.
4. Repair never grants Stage Gate passage and never changes formal vocabulary mastery.
5. When repair is complete, the learner may take a newly sampled Gate.
6. Only an actual Gate pass clears the recovery plan.
7. Previously passed stages remain unlocked; later forgetting belongs to normal review/repair.

## Device capability

Speaking remains optional when secure SpeechRecognition is unavailable. Device inability must not become learner failure.

## Persistent files

- js/gate-recovery.js
- js/gate-recovery-integration.js
- tests/gate-recovery-selfcheck.js

This branch is intentionally incremental: integration into the full B28-E UI/runtime follows after the B28-E source tree is fully represented in GitHub.
