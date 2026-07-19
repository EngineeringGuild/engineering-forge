# Engineering Forge (IDEA-010)

**A physics puzzle game that teaches real engineering.** You're an apprentice in a forge — each
level asks for a functional artifact (a bridge, eventually a circuit, a machine). You build it,
you test it, and real physics decides whether it holds. No multiple choice, no partial credit.

Part of the [Engineering Guild](https://github.com/EngineeringGuild) portfolio. See `docs/` for
the full product documentation (vision, architecture, decisions, roadmap — `GUILD_DOC_STANDARD@0.2.0`).

## Repository layout

```
engineering-forge/
├── game/                                    # the product — Vite + React + TS, client-side only
├── docs/                                    # 00_INDEX .. 06_OPERATIONS (canonical docs)
│   └── archive/2025-blockchain-university-vision/   # superseded 2025 vision, kept for history
└── legacy/                                  # archived prototypes — do not build on these
    ├── engineering-forge-v1/                #   old clicker prototype + unused MongoDB layer
    └── engineering-forge-docs/              #   old i18n documentation viewer app
```

## Quick start

```bash
cd game
npm install
npm run dev          # http://localhost:5173
```

Green gate before calling anything "done":

```bash
npm run lint && npm run type-check && npm run test && npm run build
```

## What's actually being built right now

The **Structures** pack: build a truss bridge over a given span and budget, then run a real 2D
static analysis (direct stiffness method) against the load. Members are colored by how close they
are to failing; a member that exceeds its material's capacity breaks, and a structure with an
unconstrained mechanism is flagged unstable before it's even loaded. See
`docs/02_ARCHITECTURE.md` for how the solver works, and `docs/01_VISION.md` for the full concept
("packs" per engineering discipline).

## Status

MVP in active development — see `docs/04_ROADMAP.md`. Deploy target: Cloudflare Pages,
`forge.guildeng.com`, R$0 infra posture (no backend, no database, progress in `localStorage`).
