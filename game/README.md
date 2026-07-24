# Engineering Forge — the game

Vite + React + TypeScript, 100% client-side (no backend, no database — progress lives in
`localStorage`). See `../docs/02_ARCHITECTURE.md` for the full architecture.

```bash
npm install
npm run dev            # http://localhost:5173
npm run test            # vitest — the truss, circuit, and vehicle physics
npm run lint             # oxlint
npm run type-check       # tsc -b
npm run build             # production build → dist/
```

## Structure

Three content packs, each with its own physics domain, level data, Zustand store, and UI.
`App.tsx` routes `/` (pack select) → `/structures`, `/circuits`, or `/machines` (level select) →
`/<pack>/level/:levelId` (play).

- `src/physics/linalg.ts` — shared linear solver (Gaussian elimination); Structures and Circuits
  build on it, Machines doesn't need it (closed-form kinematics instead).
- `src/physics/truss.ts` + `truss.test.ts` — Structures: 2D truss statics (direct stiffness
  method), unit-tested against a hand-calculated reference case. `materials.ts` has the buildable
  materials, including `cable` (tension-only — fails outright if it ends up in compression,
  rather than a nonlinear slack-cable re-solve).
- `src/physics/circuit.ts` + `circuit.test.ts` — Circuits: DC nodal analysis (Kirchhoff's Current
  Law) — mathematically the same conductance-matrix structure as the truss stiffness matrix, one
  DOF per node instead of two. `components.ts` has the buildable components + the given bulb load.
- `src/physics/vehicle.ts` + `vehicle.test.ts` — Machines: straight-line kinematics (Newton's
  second law + v²=2as) with a traction cap (Coulomb friction) — no canvas, the player picks an
  engine + chassis from a catalog rather than building anything spatial. `vehicleParts.ts` has the
  buildable engines/chassis.
- `src/content/levels/`, `src/content/circuitLevels/`, `src/content/vehicleLevels/` — level
  definitions per pack. Add a level by adding a file and registering it in that pack's `index.ts`.
- `src/game/build.ts`, `src/game/circuitBuild.ts`, `src/game/vehicleBuild.ts` — turn a level + the
  player's build into a model for the solver, and score cost/stars.
- `src/state/gameStore.ts`, `src/state/circuitStore.ts`, `src/state/vehicleStore.ts` — one Zustand
  store per pack: build state + persisted level progress (separate `localStorage` keys).
- `src/components/`, `src/pages/` — UI. `Toolbar.tsx` and the result-overlay pattern are shared
  shapes but each pack has its own canvas/UI (`BridgeCanvas.tsx` / `CircuitCanvas.tsx` / the
  Machines loadout cards) and overlay (`ResultOverlay.tsx` / `CircuitResultOverlay.tsx` /
  `VehicleResultOverlay.tsx`) since the failure states differ enough (collapsed/unstable vs.
  burned-out/open/too-dim vs. too-slow) that sharing one component would mean more conditionals
  than code saved.
