# B28-F restored B28-E regression — 2026-09-26

Actually executed against a freshly materialized B28-E stable archive after applying the Sentence Quest interactive Repair completion seam locally.

- `node --check sentence-quest.js`: PASS
- all top-level `*.js` via `node --check`: PASS
- `b28e_stage_gate_selfcheck.py`: PASS
- `browser_readiness_selfcheck.py`: PASS
- `deployment_selfcheck.py`: PASS
- `windows_https_selfcheck.py`: PASS
- legacy `sentence_quest_selfcheck.py`: FAIL before functional assertions because it requires `sentence-quest.js?v=028c`, while the B28-E stable `index.html` already loads `sentence-quest.js?v=028e`. This is recorded as a stale historical assertion, not counted as a green regression.

The restored source inspection also found that B28-E `WDSentenceQuest.startRepair(item)` originally returned `undefined`. B28-F requires an asynchronous completion result so Recovery is counted only after the child actually succeeds. The additive seam therefore returns a Promise and resolves only on the targeted Repair completion; cancellation resolves unsuccessful. Speaking completion remains gated at score >= 9.
