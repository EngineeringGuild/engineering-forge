# Engineering Forge — the game

Vite + React + TypeScript, 100% client-side (no backend, no database — progress lives in
`localStorage`). See `../docs/02_ARCHITECTURE.md` for the full architecture.

```bash
npm install
npm run dev            # http://localhost:5173
npm run test            # vitest — the truss + circuit physics solvers
npm run lint             # oxlint
npm run type-check       # tsc -b
npm run build             # production build → dist/
```

## Structure

Two content packs share one architecture: a pure physics solver, level data, a Zustand store, and
a canvas + toolbar UI. `App.tsx` routes `/` (pack select) → `/structures` or `/circuits` (level
select) → `/<pack>/level/:levelId` (play).

- `src/physics/linalg.ts` — shared linear solver (Gaussian elimination) both packs build on.
- `src/physics/truss.ts` + `truss.test.ts` — Structures: 2D truss statics (direct stiffness
  method), unit-tested against a hand-calculated reference case. `materials.ts` has the buildable
  materials.
- `src/physics/circuit.ts` + `circuit.test.ts` — Circuits: DC nodal analysis (Kirchhoff's Current
  Law) — mathematically the same conductance-matrix structure as the truss stiffness matrix, one
  DOF per node instead of two. `components.ts` has the buildable components + the given bulb load.
- `src/content/levels/`, `src/content/circuitLevels/` — level definitions per pack. Add a level by
  adding a file and registering it in that pack's `index.ts`.
- `src/game/build.ts`, `src/game/circuitBuild.ts` — turn a level + the player's build into a model
  for the solver, and score cost/stars.
- `src/state/gameStore.ts`, `src/state/circuitStore.ts` — one Zustand store per pack: build state +
  persisted level progress (separate `localStorage` keys).
- `src/components/`, `src/pages/` — UI. `Toolbar.tsx` and the result-overlay pattern are shared
  shapes but each pack has its own canvas (`BridgeCanvas.tsx` / `CircuitCanvas.tsx`) and overlay
  (`ResultOverlay.tsx` / `CircuitResultOverlay.tsx`) since the failure states differ enough
  (collapsed/unstable vs. burned-out/open/too-dim) that sharing one component would mean more
  conditionals than code saved.
