# B28-E application patch contract for B28-F

This contract keeps B28-E as the owner of Stage Gate rendering, scoring, and formal `profile.stageGates` passage while allowing B28-F to own recovery/retest state.

## app.js seam

Immediately after B28-E writes and saves `profile.stageGates[idx]` in `finishStageGate()`, call an optional global hook:

```js
if (typeof window.WDB28FGateFinished === 'function') {
  window.WDB28FGateFinished({
    profile,
    stageId: idx,
    passed,
    score,
    total,
    skills,
    wrong,
    speechAvailable: gateSpeechAvailable()
  });
}
```

The hook is additive. If B28-F is absent, B28-E behavior remains unchanged.

## world-map.js seam

For a gate-ready current stage, route the button through an optional B28-F action hook and fall back to B28-E `startStageGate(stageId)`:

```js
onclick="window.WDB28FWorldMapGateAction
  ? WDB28FWorldMapGateAction(stageId)
  : startStageGate(stageId)"
```

The B28-F hook resolves `gate / repair / retest / passed`; formal `stageGates[stageId].passed` always has priority.

## Required invariants

- B28-E owns formal passage.
- B28-F Repair cannot grant passage.
- A passed stage cannot be relocked by stale Recovery.
- Secure SpeechRecognition unavailable => speaking omitted, not failed.
- Repair does not mutate XP or formal vocabulary mastery.
- Retest prefers fresh questions when candidate pool permits.
- Missing B28-F scripts must leave B28-E functional through fallback behavior.
