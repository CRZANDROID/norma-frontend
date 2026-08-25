# 001 — Transition StepRow dot and badge on source status change

- **Status**: DONE
- **Commit**: `06f0c74`
- **Severity**: MEDIUM
- **Category**: Missed opportunities (state indication)
- **Estimated scope**: 1 file (`src/features/dashboard/components/AgentWatch.tsx`), ~80 lines in `StepRow` plus a small helper in the same file

## Problem

The dashboard polls `/jobs/progress` and `/documents/progress` every 8s (`src/features/dashboard/hooks/useAgentWatch.ts`, `POLL_MS = 8000`). When a source moves from waiting → crawled / extracting → ready (or unread), `StepRow` swaps the rail dot color and the `Badge` label with **no bridge**. The analyst is watching this exact seam; the snap reads as a refresh, not as the agent advancing.

Current code — `src/features/dashboard/components/AgentWatch.tsx:95-143`:

```tsx
function StepRow({
  icon: Icon,
  title,
  label,
  tone,
  meta,
  body,
  last,
}: {
  icon: typeof Radar
  title: string
  label: string
  tone: StepTone
  meta?: string | null
  body?: string | null
  last?: boolean
}) {
  return (
    <li className="flex gap-3">
      <div className="flex w-5 flex-col items-center">
        <span
          className={cn(
            'mt-1 size-2.5 shrink-0 rounded-full',
            toneDot(tone),
            tone === 'live' && 'motion-safe:animate-pulse',
          )}
        />
        {/* … rail … */}
      </div>
      <div className={cn('min-w-0 flex-1', last ? 'pb-0' : 'pb-4')}>
        <div className="flex flex-wrap items-center gap-2">
          {/* … icon + title … */}
          <Badge variant={badgeFor(tone)}>{label}</Badge>
          {/* … meta … */}
        </div>
        {/* … body … */}
      </div>
    </li>
  )
}
```

`toneDot` / `badgeFor` already map `StepTone` (`done | live | warn | fail | wait`) to Tailwind classes. The mapping stays. Only the **change** needs motion.

`SourceCard` already staggers **mount** of the whole card (`opacity` + `y: 8`, `duration.ui`, delay `index * 0.04`). Do not stack another entrance on first paint of the badge/dot.

## Target

### When to animate

Fire motion **only if `tone` and/or `label` actually changed** since the previous render of that `StepRow`.

- Poll with the same `tone` + `label` → **zero** animation (critical: 8s poll).
- `tone` changed → pop the **dot** + crossfade the **badge**.
- `label` changed but `tone` stayed the same → crossfade the **badge** only; **do not** pop the dot.
- First mount of the row (list just appeared after loading) → **no** pop, **no** badge fade (`AnimatePresence initial={false}`; skip first `tone` in the ref effect).

Ignore `meta` and `body` for this plan (clock / headline can change without a status beat).

### Dot (rail)

- Properties: **`transform` only** (not `background-color`, not `width`). Color still swaps via existing `toneDot(tone)` classes instantly; the pop is the state-indication beat.
- One-shot (not a loop): `transform: scale(1) → scale(1.18) → scale(1)`.
- Duration: **200ms** total (`duration.ui` in this repo is `0.2` seconds).
- Easing: **`easeOut`** from `src/shared/lib/motion.ts` — array `[0.23, 1, 0.32, 1]` (same as CSS `cubic-bezier(0.23, 1, 0.32, 1)`).
- Do **not** use Motion’s `scale` shorthand. Use the full transform string (repo audit rule: Motion `scale`/`x`/`y` run on the main thread):

```tsx
animate={{ transform: ['scale(1)', 'scale(1.18)', 'scale(1)'] }}
transition={{ duration: duration.ui, ease: easeOut }}
```

- Never `scale(0)`. Peak `1.18` is a confirmation pop, not an entrance from nothing.
- Keep `tone === 'live' && 'motion-safe:animate-pulse'` on the same node (Tailwind opacity pulse). Do not add a second infinite scale loop.
- **`prefers-reduced-motion`**: if `useReducedMotion()` is true, **do not** scale. Optional comprehension beat: `opacity: [1, 0.7, 1]` over **`duration.fast` (0.16s)** `easeOut`. If that fights `animate-pulse` while `tone === 'live'`, skip the opacity flash and keep the existing pulse only.

Interruptibility: drive the pop with `useAnimationControls().start(...)` on tone change (or increment a `popGeneration` counter that is **not** used as a React `key` on the dot — remounting restarts from zero). Calling `start` again mid-pop must replace the running tween, not queue a second loop.

Skip the first effect run so loading → list does not pop every dot.

### Badge

- Do **not** edit `src/shared/ui/badge.tsx` (used on other screens). Wrap locally in `StepRow`.
- Do **not** animate layout/`width`/`popLayout` (layout animations are not transform/opacity-only).
- Crossfade **opacity** of the badge contents, keyed by `` `${tone}-${label}` ``:

```tsx
<AnimatePresence initial={false}>
  <motion.span
    key={`${tone}-${label}`}
    className="inline-flex"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: duration.fast, ease: easeOut }}
  >
    <Badge variant={badgeFor(tone)}>{label}</Badge>
  </motion.span>
</AnimatePresence>
```

- Duration: **160ms** (`duration.fast` = `0.16`).
- Easing: same `easeOut` `[0.23, 1, 0.32, 1]`.
- `initial={false}` on `AnimatePresence` so the first badge of a newly mounted card does not fade in (the card already did).
- Reduced motion: keep the opacity crossfade at **160ms**; do not add translate/scale on the badge.
- Overlap during 160ms (default `AnimatePresence` mode, not `wait`) is acceptable for a small chip. Do not add `filter: blur()`.

### Out of target

No change to `PhaseMeter`, header `PulseDot`, `SourceCard` mount stagger, error banners, or chat.

## Repo conventions to follow

- Motion library: `motion/react` (already imported in this file).
- Durations/easings: `import { duration, easeOut } from '@/shared/lib/motion'` — **do not** invent a new cubic-bezier.
- Reduced motion: `useReducedMotion()` from `motion/react`, same as `SourceCard` and `PulseDot` in this file.
- Animate **transform and opacity only**. No `transition: all`. No color transitions as the “animation”.
- Tailwind: zero hand-written CSS files; utilities + Motion props only.
- Exemplar of enter/ease already in this file — `src/features/dashboard/components/AgentWatch.tsx:161-168`:

```tsx
<motion.article
  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: duration.ui,
    ease: easeOut,
    delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.28),
  }}
```

Do **not** copy `y` onto the badge. The exemplar is for tokens and `useReducedMotion`, not for translating the chip.

- Chat turns use the same tokens: `src/features/ai/components/CatalogAskCard.tsx:315-319` (`duration.ui`, `easeOut`, opacity + `y`). Badge stays opacity-only.

## Steps

1. **Imports** in `src/features/dashboard/components/AgentWatch.tsx`: add `AnimatePresence` to the `motion/react` import; add `useEffect`, `useRef`, `useState` from `react` (file currently has no React hooks import).

2. **Add a helper in the same file** (above `StepRow`), e.g. `StatusRailDot({ tone }: { tone: StepTone })`:
   - `useReducedMotion()`, `useAnimationControls()`, `useRef` for previous tone, `useRef` for `hasMounted`.
   - `useEffect` on `[tone, controls, reduceMotion]`:
     - If `!hasMounted.current`: set `hasMounted.current = true`, store `tone`, **return** (no animation).
     - If `prevTone.current === tone`: return.
     - Set `prevTone.current = tone`.
     - If `reduceMotion`: optionally `controls.start({ opacity: [1, 0.7, 1], transition: { duration: duration.fast, ease: easeOut } })` unless `tone === 'live'` (pulse owns opacity).
     - Else: `controls.start({ transform: ['scale(1)', 'scale(1.18)', 'scale(1)'], transition: { duration: duration.ui, ease: easeOut } })`.
   - Render `motion.span` with `animate={controls}`, `initial={false}`, `className` exactly as today’s dot (`mt-1 size-2.5 shrink-0 rounded-full origin-center`, `toneDot(tone)`, live pulse class). `origin-center` so scale pops from the circle’s center.

3. **Replace** the static `<span className={cn('mt-1 size-2.5 …')} />` inside `StepRow` with `<StatusRailDot tone={tone} />`.

4. **Wrap** `<Badge variant={badgeFor(tone)}>{label}</Badge>` with the `AnimatePresence` + `motion.span` block from Target. Keep `Badge` API unchanged.

5. **Do not** key `StepRow` or `SourceCard` by status (that remounts the card and re-runs the 40ms stagger). Keys stay `journey.sourceId` on the list item.

6. If `useAnimationControls` + keyframe `transform` array proves awkward in Motion 12, equivalent allowed fallback: `animate` prop `{ transform: 'scale(1)' }` plus a one-shot class is **not** preferred. Second fallback: increment `popId` state and pass `animate` with the keyframe array **without** putting `popId` on `key`. Do not remount the dot.

## Boundaries

- Do NOT modify `src/shared/ui/badge.tsx`, `src/shared/lib/motion.ts`, `CatalogAskCard`, `useAgentWatch` poll interval, `PulseDot` in the navy header, `PhaseMeter`, or `SourceCard` entrance.
- Do NOT add npm dependencies.
- Do NOT animate `background-color`, `width`, `height`, or Framer `layout`.
- Do NOT add infinite scale/glow on idle “En mesa” / `done` dots.
- Do NOT pop dots when the parent list first replaces skeletons.
- If `AgentWatch.tsx` `StepRow` no longer matches the excerpts above (drift), STOP and report; do not invent a new animation on a different component.

## Verification

- **Mechanical**: from repo root, `pnpm exec tsc -b --pretty false` exits 0. No new lint on `AgentWatch.tsx`.
- **Feel check**:
  - Load `/dashboard` with sources already filled: **no** badge fade and **no** dot pop on first paint (only existing card stagger).
  - Leave the tab open 8s with unchanged statuses: **no** motion on dots/badges (poll must be invisible).
  - Force a status change (admin “Poner a rastrear”, or a source that is still `wait` then becomes `done`): **one** 200ms scale pop on that row’s matching step dot, **one** 160ms badge opacity swap, then rest. The other step in the same card must stay still if its `tone`/`label` did not change.
  - Spam-change: if two updates arrive quickly, the pop retargets; it must not stack multiple 200ms loops.
  - DevTools → Rendering → `prefers-reduced-motion: reduce`: no scale on the dot; badge may still opacity-crossfade at 160ms; live pulse may be suppressed by `motion-safe:` already.
  - Animations panel at 10% playback: confirm the transform is `scale` around 1.0–1.18, not a color tween and not `scale(0)`.
- **Done when**: first paint and quiet polls are still; a real `tone`/`label` change is readable as a single short beat; reduced-motion drops the scale.
