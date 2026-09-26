# B28-E → B28-F Application Integration Map

Verified against the restored B28-E stable archive whose SHA-256 is:

`4f86103712c4046c820a21daf73d6a918367a4fc8993607753b4c188eb5341aa`

## Restored B28-E application facts

- `index.html` loads `world-map.js?v=028e`, `sentence-quest.js?v=028e`, then `app.js?v=rc6-b28e`.
- Existing Stage Gate implementation lives inside `app.js`; there is no standalone `stage-gate.js`.
- `startStageGate(stageIndex)` builds the complete Gate task array immediately from the current stage word range.
- Gate skills are vocabulary, listening, sentence and optional speaking.
- Speaking is omitted when secure SpeechRecognition is unavailable.
- `finishStageGate()` currently writes `profile.stageGates[idx]` directly and renders pass/repair UI.
- Wrong Gate answers currently also call the legacy `addSkillRepair()` queue.
- `world-map.js` decides Gate readiness and directly calls `startStageGate(currentStage)`.
- Sentence Quest already supports listening, sentence-order and speaking repair entry points through `WDSentenceQuest.startRepair(item)`.

## Integration seam

B28-F must not replace the proven B28-E question renderers. Instead, refactor the existing Stage Gate into:

1. **Gate preparation**
   - Build candidate task descriptors with stable question IDs.
   - Initial Gate samples normally.
   - Retest asks B28-F sampler/history for fresh IDs.

2. **Existing B28-E renderer/evaluator**
   - Keep current vocabulary/listening/sentence/speaking UI and scoring.
   - Keep device-capability behavior: unavailable speaking is skipped, never failed.

3. **Gate completion callback**
   - Normalize B28-E result into:
     - `passed`
     - `weakSkills`
     - `failedWordIds`
     - `testedSkills`
   - Existing B28-E runtime remains the sole owner of formal `profile.stageGates[idx].passed`.
   - B28-F controller only creates/clears recovery state.

4. **Map state**
   - `world-map.js` should render one of:
     - Gate
     - Dragon Repair
     - Retest
   - Repair must be completed before Retest.
   - Previously passed stages remain unlocked.

5. **Repair activity bridge**
   - vocabulary → existing vocabulary repair
   - listening → `WDSentenceQuest.startRepair({skill:'listening', ...})`
   - sentence → `WDSentenceQuest.startRepair({skill:'sentence', ...})`
   - speaking → `WDSentenceQuest.startRepair({skill:'speaking', ...})`
   - only successful activity completion counts toward B28-F recovery progress.

## Required browser load order

Load B28-F modules after the existing B28-E core/profile/Sentence Quest dependencies and before the final application bootstrap. Use `WordDragonGateRecoveryManifest` as the canonical dependency order.

## Import audit

The restored archive contains 188 files before filtering. Public GitHub import filtering removes backups, `__pycache__`, pyc files, profiles/backups, certificates/private keys and root CA material.

Filtered application import set: **136 files / 4,560,899 bytes**, including five WAV assets.

Largest file: `words-3000.json` (3,587,098 bytes).

## Validation gates before B28-F can become stable

- Existing B28-E specialty selfcheck
- B28-F 14/14 CI selfchecks
- top-level JavaScript syntax checks
- deployment selfcheck
- browser readiness selfcheck
- Windows HTTPS selfcheck
- application-level Gate → Repair → Retest flow
- legacy profile migration preservation
- real Android Chrome microphone remains a separate device verification item
