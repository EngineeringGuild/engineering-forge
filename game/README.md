# Engineering Forge — the game

Vite + React + TypeScript, 100% client-side (no backend, no database — progress lives in
`localStorage`). See `../docs/02_ARCHITECTURE.md` for the full architecture.

```bash
npm install
npm run dev            # http://localhost:5173
npm run test            # vitest — mainly the truss physics solver
npm run lint             # oxlint
npm run type-check       # tsc -b
npm run build             # production build → dist/
```

## Structure

- `src/physics/` — the 2D truss statics solver (direct stiffness method) + materials. Pure,
  framework-free, unit-tested against a hand-calculated reference case in `truss.test.ts`.
- `src/content/levels/` — level definitions (span, supports, loads, budget). Add a level by adding
  a file here and registering it in `levels/index.ts`.
- `src/game/build.ts` — turns a level + the player's build into a `TrussModel` for the solver, and
  scores cost/stars.
- `src/state/gameStore.ts` — Zustand store: current build state + persisted level progress.
- `src/components/`, `src/pages/` — UI.
