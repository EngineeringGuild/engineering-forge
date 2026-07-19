# Legacy code — archived, do not build on this

This directory holds the two apps that existed before the DEC-010-004 rewrite (2026-07-19).
Kept for history ("add, don't delete" — Guild convention), not maintained.

- **`engineering-forge-v1/`** — a generic clicker prototype (no relation to any of the product
  visions the repo has had) plus a MongoDB/Mongoose data layer that was never connected to the UI.
  A hardcoded database credential found here was removed from source in the same commit that moved
  this directory — see `docs/03_DECISIONS.md` DEC-010-007 for the required credential rotation.
- **`engineering-forge-docs/`** — a polished 5-language (en/pt/fr/uk/zh) documentation viewer site.
  Genuinely well-built, but superseded by the plain-markdown `docs/00_INDEX.md`..`06_OPERATIONS.md`
  standard; reviving it would need to point at the new docs, not the archived
  `docs/archive/2025-blockchain-university-vision/` content.

The current product lives in `../game/`.
